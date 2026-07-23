import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { notifyOwnerOfNewContact } from "@/lib/notifications";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`rate:contact:${clientIp(req)}`, 5, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many messages — please try again later" }, { status: 429 });

  try {
    const { name, email, subject, message } = await req.json();
    // subject is required — the contact_submissions table has a NOT NULL
    // constraint on it, so validate here rather than letting a missing
    // subject surface as a raw Postgres constraint-violation message.
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (String(name).length > 120 || String(email).length > 254 ||
        String(subject).length > 200 || String(message).length > 5000) {
      return NextResponse.json({ error: "One or more fields are too long" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("contact_submissions").insert({
      name,
      email,
      subject,
      message,
      status: "new",
    });

    if (error) throw error;

    notifyOwnerOfNewContact({ name, email, subject, message }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to send message" }, { status: 500 });
  }
}
