import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function requireAdmin() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const isAdmin =
    ADMIN_EMAILS.length > 0
      ? ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")
      : user.user_metadata?.is_admin === true;

  if (!isAdmin) redirect("/");
  return user;
}

export async function getAdminUser() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const isAdmin =
    ADMIN_EMAILS.length > 0
      ? ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? "")
      : user.user_metadata?.is_admin === true;
  return isAdmin ? user : null;
}
