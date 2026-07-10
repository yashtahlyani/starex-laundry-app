import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PLANS } from "@/lib/pricing";
import { BookingService } from "@/lib/services/booking.service";
import { checkRateLimit } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

type BookingRequest = {
  serviceId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  pickupSlotStart: string;
  pickupSlotEnd: string;
  notes?: string;
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const allowed = await checkRateLimit(`rl:booking:${ip}`, 5, 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  let body: BookingRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { serviceId, name, email, phone, address, postalCode, pickupSlotStart, pickupSlotEnd, notes } = body;

  if (!serviceId || !name || !email || !phone || !address || !postalCode || !pickupSlotStart || !pickupSlotEnd) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!PLANS.some((p) => p.id === serviceId)) {
    return NextResponse.json({ error: "Unknown serviceId" }, { status: 400 });
  }

  try {
    const service = new BookingService(getSupabaseAdmin());
    const result = await service.createBooking({
      serviceId,
      name,
      email,
      phone,
      address,
      postalCode,
      pickupSlotStart,
      pickupSlotEnd,
      notes,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to create booking" }, { status: 500 });
  }
}
