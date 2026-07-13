import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { BookingService } from "@/lib/services/booking.service";
import { PLANS } from "@/lib/pricing";
import { enqueueBookingConfirmation } from "@/lib/queue/notification.queue";
import { notifyOwnerOfNewOrder } from "@/lib/notifications";

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
};

export async function POST(req: NextRequest) {

  const cookieStore = cookies();
  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  );
  // Signing in is optional — guests can book with just their contact details.
  const { data: { user } } = await supabase.auth.getUser();

  let body: BookingRequest;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const { service, name, email, phone, address, date, timeSlot, notes } = body;
  if (!service || !name || !email || !phone || !address || !date || !timeSlot) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!PLANS.some((p) => p.id === service)) {
    return NextResponse.json({ error: "Unknown service" }, { status: 400 });
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
