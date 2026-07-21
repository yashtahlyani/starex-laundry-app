import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { OWNER_EMAIL } from "@/lib/owner";

const stripBOM = (s: string) => s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;

// Hardcoded fallback so admin access never silently breaks if ADMIN_EMAILS
// isn't set (or is set to something unexpected) in a given deployment
// environment — this is the same address the rest of the app (Navbar,
// auth, dashboard — see lib/owner.ts) already treats as the owner account.
const FALLBACK_ADMIN_EMAILS = [OWNER_EMAIL];

const ADMIN_EMAILS = Array.from(new Set([
  ...FALLBACK_ADMIN_EMAILS,
  ...(process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
]));

function checkIsAdmin(user: { email?: string | null; user_metadata?: any }) {
  return ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "") || user.user_metadata?.is_admin === true;
}

// getAll (not get-only) is required so a session cookie that Supabase has
// split into chunks (sb-<ref>-auth-token.0, .1, ...) — which happens once
// the session payload crosses ~3180 bytes — gets correctly reassembled.
// get-only silently sees no session at all for a chunked cookie.
export async function requireAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");
  if (!checkIsAdmin(user)) redirect("/");
  return user;
}

export async function getAdminUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return checkIsAdmin(user) ? user : null;
}
