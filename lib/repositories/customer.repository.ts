import type { SupabaseClient } from "@supabase/supabase-js";

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export class CustomerRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByEmail(email: string): Promise<Customer | null> {
    const { data } = await this.db
      .from("customers")
      .select("id, full_name, email, phone, created_at")
      .eq("email", email)
      .maybeSingle();
    return (data as Customer | null) ?? null;
  }

  // Upsert on unique email — fixes the duplicate-customer bug where the same person
  // booking twice created two separate rows with no shared order history.
  async upsert(input: Pick<Customer, "full_name" | "email" | "phone">): Promise<Customer> {
    const { data, error } = await this.db
      .from("customers")
      .upsert(input, { onConflict: "email" })
      .select()
      .single();
    if (error || !data) throw error ?? new Error("Failed to upsert customer");
    return data as Customer;
  }
}
