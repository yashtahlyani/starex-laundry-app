import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

const stripBOM = (s: string) => s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;

// Supabase redirects here after email confirmation / password reset
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
      stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (type === "recovery") return NextResponse.redirect(`${origin}/auth?mode=new-password`);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth_callback_failed`);
}
