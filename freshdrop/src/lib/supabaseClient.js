import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

// The app runs in local mode until BOTH env vars are present.
// Add them in .env (see .env.example) to switch to the shared cloud database.
export const isSupabaseEnabled = Boolean(url && anon)

export const supabase = isSupabaseEnabled ? createClient(url, anon) : null
