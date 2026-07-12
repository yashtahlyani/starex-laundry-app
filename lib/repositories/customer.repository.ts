import type { SupabaseClient } from "@supabase/supabase-js";

// Uses the freshdrop `profiles` table (id = auth.uid)
export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  created_at?: string;
}

export class CustomerRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByEmail(email: string): Promise<Profile | null> {
    const { data } = await this.db
      .from("profiles")
      .select("id, name, email, phone, role")
      .eq("email", email)
      .maybeSingle();
    return (data as Profile | null) ?? null;
  }

  async findById(id: string): Promise<Profile | null> {
    const { data } = await this.db
      .from("profiles")
      .select("id, name, email, phone, role")
      .eq("id", id)
      .maybeSingle();
    return (data as Profile | null) ?? null;
  }

  async upsert(input: { id: string; name: string; email: string; phone: string }): Promise<Profile> {
    const { data, error } = await this.db
      .from("profiles")
      .upsert({ id: input.id, name: input.name, email: input.email, phone: input.phone, role: "customer" }, { onConflict: "id" })
      .select()
      .single();
    if (error || !data) throw error ?? new Error("Failed to upsert profile");
    return data as Profile;
  }
}
