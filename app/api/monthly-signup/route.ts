import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notifyOwnerOfNewContact } from "@/lib/notifications";

export const dynamic = "force-dynamic";

// The Monthly Plan is a recurring subscription, not a one-off weighed order —
// it doesn't fit the existing orders table, and there's no live recurring-billing
// gateway connected yet to actually charge a card here. Rather than build a fake
// payment form, this captures a real signup request (reusing the already-tested
// contact_submissions table + owner notification pipeline) so staff follow up
// to confirm the start date and arrange payment.
export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, address, startDate } = await req.json();
    if (!name || !email || !phone || !address || !startDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
