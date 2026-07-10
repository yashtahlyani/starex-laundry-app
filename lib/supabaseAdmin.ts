import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key — bypasses RLS.
// Never import this from a "use client" component; API routes / server code only.
//
// Created lazily (on first call) rather than at module load, so that Next.js
// build-time page-data collection does NOT instantiate it before env vars are
// available. Call getSupabaseAdmin() inside your request handler / server code.
let _admin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_admin) return _admin;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase admin is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  _admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  return _admin;
}
