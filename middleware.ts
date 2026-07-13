import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const stripBOM = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

// Refreshes the Supabase session cookie on every request so it never
// silently expires mid-session — required whenever createBrowserClient /
// createServerClient (cookie-based auth) is used, per Supabase's SSR setup.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
