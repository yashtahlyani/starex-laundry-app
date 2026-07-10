import type { SupabaseClient } from "@supabase/supabase-js";

export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  service_type: string;
  status: string;
  pickup_address: string;
  postal_code: string;
  pickup_slot_start: string;
  pickup_slot_end: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  stripe_payment_intent_id: string | null;
  price_estimate_cents: number | null;
}

export type NewOrder = Omit<Order, "id" | "created_at" | "updated_at">;

export class OrderRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByCode(orderCode: string): Promise<Order | null> {
    const { data, error } = await this.db
      .from("orders")
      .select("id, order_code, service_type, status, pickup_address, pickup_slot_start, pickup_slot_end, created_at")
      .eq("order_code", orderCode)
      .single();
    if (error || !data) return null;
    return data as Order;
  }

  async findByCodeWithCustomer(orderCode: string) {
    const { data, error } = await this.db
      .from("orders")
      .select("id, status, customer_id, customers(full_name, email, phone)")
      .eq("order_code", orderCode)
      .single();
    if (error || !data) return null;
    return data as typeof data & { customers: { full_name: string; email: string; phone: string } | null };
  }

  async create(input: NewOrder): Promise<Order> {
    const { data, error } = await this.db.from("orders").insert(input).select().single();
    if (error) throw error;
    return data as Order;
  }

  async updateStatus(id: string, status: string): Promise<void> {
    const { error } = await this.db
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  }

  async updatePaymentIntent(id: string, intentId: string, estimateCents: number): Promise<void> {
    const { error } = await this.db
      .from("orders")
      .update({ stripe_payment_intent_id: intentId, price_estimate_cents: estimateCents })
      .eq("id", id);
    if (error) throw error;
  }

  async appendStatusEvent(
    orderId: string,
    status: string,
    note: string | null,
    createdBy: string
  ): Promise<void> {
    const { error } = await this.db
      .from("order_status_events")
      .insert({ order_id: orderId, status, note, created_by: createdBy });
    if (error) throw error;
  }

  async getStatusEvents(orderId: string) {
    const { data } = await this.db
      .from("order_status_events")
      .select("status, note, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    return data ?? [];
  }

  async findByCustomerId(customerId: string) {
    const { data, error } = await this.db
      .from("orders")
      .select("id, order_code, service_type, status, pickup_address, pickup_slot_start, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  }
}
