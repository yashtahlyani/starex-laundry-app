import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`rate:newsletter:${clientIp(req)}`, 10, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many requests — try again later" }, { status: 429 });

  let body: { email?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  }

  // ON CONFLICT DO NOTHING via ignoreDuplicates — re-subscribing is a no-op, not
  // an error, so the user always sees success.
  const { error } = await getSupabaseAdmin()
    .from("newsletter_subscribers")
    .upsert({ email }, { onConflict: "email", ignoreDuplicates: true });

  if (error) return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
