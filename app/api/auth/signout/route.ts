import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const dynamic = "force-dynamic";

const stripBOM = (s: string) => s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;

export async function POST() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
    {
      cookies: {
        getAll:    ()                        => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
  await supabase.auth.signOut();
  return NextResponse.redirect(
    new URL("/auth", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    { status: 303 }
  );
}
