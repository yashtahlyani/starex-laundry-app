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

    // Fire-and-forget: never let a notification failure block the booking response.
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
    enqueueBookingConfirmation(notificationPayload).catch(() => {});
    notifyOwnerOfNewOrder(notificationPayload).catch(() => {});

    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create booking" }, { status: 500 });
  }
}
