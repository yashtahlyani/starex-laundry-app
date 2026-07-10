import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// Supabase redirects here after email confirmation / password reset
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
    if (!error) {
      if (type === "recovery") return NextResponse.redirect(`${origin}/auth?mode=new-password`);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`);
}
