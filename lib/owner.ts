// Single source of truth for the owner/admin account.
//
// Client components can only see this constant (it's inlined into the public
// bundle), so it's identification, not security — real admin authorization
// happens server-side in lib/adminAuth.ts, which also honours the ADMIN_EMAILS
// env var and the is_admin user-metadata flag.
export const OWNER_EMAIL = "owner@starex.ca";

export function isOwnerUser(
  user: { email?: string | null; user_metadata?: { is_admin?: boolean } } | null | undefined
): boolean {
  if (!user) return false;
  return user.email?.toLowerCase() === OWNER_EMAIL || user.user_metadata?.is_admin === true;
}
