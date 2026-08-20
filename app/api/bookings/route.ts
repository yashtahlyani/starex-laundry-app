import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { BookingService } from "@/lib/services/booking.service";
import { PLANS } from "@/lib/pricing";
import { enqueueBookingConfirmation } from "@/lib/queue/notification.queue";
import { notifyOwnerOfNewOrder } from "@/lib/notifications";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

const stripBOM = (s: string) => s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;

// Vercel functions run in UTC, but pickup dates/windows are always meant in
// Eastern time (the service area is Brampton & Mississauga) — comparing
// against the server's raw UTC clock would reject or allow the wrong slots
// by several hours depending on time of year.
function nowInToronto(): { dateStr: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find(p => p.type === t)!.value;
  return {
    dateStr: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")) + Number(get("minute")) / 60,
  };
}

type BookingRequest = {
  service: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  date: string;
  timeSlot: string;
  notes?: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  cardBrand?: string;
  cardLast4?: string;
};

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`rate:book:${clientIp(req)}`, 10, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many bookings from this connection — please try again later" }, { status: 429 });

  const cookieStore = cookies();
  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  // Signing in is optional — guests can book with just their contact details.
  const { data: { user } } = await supabase.auth.getUser();

  let body: BookingRequest;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { service, name, email, phone, address, date, timeSlot, notes, stripeCustomerId, stripePaymentMethodId, cardBrand, cardLast4 } = body;
  if (!service || !name || !email || !phone || !address || !date || !timeSlot) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!PLANS.some((p) => p.id === service)) {
    return NextResponse.json({ error: "Unknown service" }, { status: 400 });
  }
  if (name.length > 120 || email.length > 254 || phone.length > 40 || address.length > 300 ||
      date.length > 20 || timeSlot.length > 40 || (notes?.length ?? 0) > 1000) {
    return NextResponse.json({ error: "One or more fields are too long" }, { status: 400 });
  }
  // Mirrors the client-side checks in app/book/page.tsx — the UI form can't be
  // trusted alone since this endpoint is reachable directly (curl, bots), and a
  // garbage email/phone/date here means a driver gets dispatched for nothing.
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
  }
  if (address.trim().length < 8) {
    return NextResponse.json({ error: "Enter a full pickup address" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date).getTime())) {
    return NextResponse.json({ error: "Invalid pickup date" }, { status: 400 });
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (new Date(`${date}T00:00:00`) < today) {
    return NextResponse.json({ error: "Pickup date can't be in the past" }, { status: 400 });
  }
  // Same-day bookings can't select a pickup window that's already started —
  // mirrors the slot filtering in app/book/page.tsx (Eastern time, matching
  // the service area, not the server's UTC clock).
  const nowET = nowInToronto();
  if (nowET.dateStr === date) {
    const slotStartHour = { "8:00 AM": 8, "11:00 AM": 11, "2:00 PM": 14, "5:00 PM": 17 }[timeSlot.split(" – ")[0]];
    if (slotStartHour != null && slotStartHour <= nowET.hour) {
      return NextResponse.json({ error: "That pickup window has already started today — please choose a later window or another date" }, { status: 400 });
    }
  }

  try {
    const bookingService = new BookingService(getSupabaseAdmin());
    const result = await bookingService.createBooking({
      userId: user?.id ?? null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      service,
      date,
      timeSlot,
      notes: notes?.trim(),
      stripeCustomerId,
      stripePaymentMethodId,
      cardBrand,
      cardLast4,
    });

    // Awaited (not fire-and-forget): on Vercel, the function's execution
    // environment can freeze the instant the response is sent, killing any
    // still-in-flight promise — an un-awaited notification here would send
    // *sometimes*, depending on how fast Resend happened to respond. A
    // notification failure still can't fail the booking itself, so each
    // call is wrapped so it can never throw past this point.
    const notificationPayload = {
      orderId: result.orderId,
      orderCode: result.orderCode,
      customerName: name.trim(),
      customerEmail: email.trim().toLowerCase(),
      customerPhone: phone.trim(),
      serviceType: service,
      pickupDate: date,
      pickupTimeSlot: timeSlot,
      pickupAddress: address.trim(),
    };
    await Promise.allSettled([
      enqueueBookingConfirmation(notificationPayload),
      notifyOwnerOfNewOrder(notificationPayload),
    ]);

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create booking" }, { status: 500 });
  }
}
