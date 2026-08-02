import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notifyOwnerOfNewContact } from "@/lib/notifications";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

// The Monthly Plan is a recurring subscription, not a one-off weighed order —
// it doesn't fit the existing orders table, and there's no live recurring-billing
// gateway connected yet to actually charge a card here. Rather than build a fake
// payment form, this captures a real signup request (reusing the already-tested
// contact_submissions table + owner notification pipeline) so staff follow up
// to confirm the start date and arrange payment.
export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`rate:monthly:${clientIp(req)}`, 5, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again later" }, { status: 429 });

  try {
    const { name, email, phone, address, startDate } = await req.json();
    if (!name || !email || !phone || !address || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (String(name).length > 120 || String(email).length > 254 || String(phone).length > 40 || String(address).length > 300) {
      return NextResponse.json({ error: "One or more fields are too long" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(String(email).trim())) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (String(phone).replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid phone number" }, { status: 400 });
    }

    const message =
      `Monthly Plan signup request\n\n` +
      `Preferred start date: ${startDate}\n` +
      `Address: ${address}\n` +
      `Phone: ${phone}`;

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      phone,
      subject: "Monthly Plan Signup",
      message,
      status: "new",
    });
    if (error) throw error;

    notifyOwnerOfNewContact({ name, email, subject: "Monthly Plan Signup", message }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to submit signup" }, { status: 500 });
  }
}
