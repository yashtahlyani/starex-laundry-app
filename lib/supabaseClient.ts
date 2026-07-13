import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser (anon) client. Created lazily on first use so that server-side
// rendering / build-time evaluation never instantiates it before the
// NEXT_PUBLIC_* env vars are available. Call getSupabaseBrowser() inside
// client-component effects/handlers.
//
// Uses @supabase/ssr's createBrowserClient (not plain @supabase/supabase-js
// createClient) so the session is persisted as cookies, not just
// localStorage. Every server-rendered page and API route (requireAdmin(),
// /api/dashboard/orders, /api/bookings, etc.) reads the session via cookies
// through createServerClient — with a localStorage-only client, the server
// never sees a logged-in user, which broke /admin and /dashboard.
let _browser: SupabaseClient | null = null;

const stripBOM = (s: string) => s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;

export function getSupabaseBrowser(): SupabaseClient {
  if (_browser) return _browser;

  const supabaseUrl = stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
  const supabaseAnonKey = stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  _browser = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return _browser;
}
