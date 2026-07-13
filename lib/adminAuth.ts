import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

const stripBOM = (s: string) => s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;

// Hardcoded fallback so admin access never silently breaks if ADMIN_EMAILS
// isn't set (or is set to something unexpected) in a given deployment
// environment — this is the same address the rest of the app (Navbar,
// Footer) already treats as the owner account.
const FALLBACK_ADMIN_EMAILS = ["owner@starex.ca"];

const ADMIN_EMAILS = Array.from(new Set([
  ...FALLBACK_ADMIN_EMAILS,
  ...(process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean),
]));

function checkIsAdmin(user: { email?: string | null; user_metadata?: any }) {
  return ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "") || user.user_metadata?.is_admin === true;
}

export async function requireAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
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
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return checkIsAdmin(user) ? user : null;
}
