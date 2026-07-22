import type { SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { generateOrderCode } from "@/lib/orderCode";

// Freshdrop orders schema
export interface Order {
  id: string;
  code: string;
  user_id: string | null;
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  service_title: string;
  date: string;
  time_slot: string;
  notes: string | null;
  status: string;
  status_history: StatusEvent[];
  weight: string | null;
  price: number | null;
  rating: number | null;
  is_new: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusEvent {
  status: string;
  label: string;
  time: string;
  note?: string;
  // Recorded on the "picked_up" event = items received from the customer;
  // recorded on the "delivered" event = items actually returned. Comparing
  // the two (see lib/itemTracking.ts) is how staff catch a lost item before
  // the customer has to notice it themselves.
  itemCount?: number;
}

export type NewOrder = Omit<Order, "id" | "created_at" | "updated_at">;

const SERVICE_TITLES: Record<string, string> = {
  "wash-fold": "Wash & Fold",
  "express":   "Same-Day Express",
  "dry-clean": "Dry Cleaning",
  ironing:     "Ironing & Pressing",
  household:   "Household Items",
  detailing:   "Car & Sofa Detailing",
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Order Placed",
  confirmed: "Confirmed",
  picked_up: "Picked Up",
  in_process: "In Process",
  ready_for_delivery: "Ready for Delivery",
  payment_pending: "Payment Pending",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export class OrderRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByCode(code: string): Promise<Order | null> {
    const { data, error } = await this.db
      .from("orders")
      .select("*")
      .eq("code", code)
      .single();
    if (error || !data) return null;
    return data as Order;
  }

  async findByCodeWithProfile(code: string) {
    const { data, error } = await this.db
      .from("orders")
      .select("id, code, status, user_id, customer_name, email, phone, profiles(name, email, phone)")
      .eq("code", code)
      .single();
    if (error || !data) return null;
    return data;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    const { data, error } = await this.db
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Order[];
  }

  async findAllForAdmin(): Promise<Order[]> {
    const { data, error } = await this.db
      .from("orders")
      .select("*, profiles(name, email, phone)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Order[];
  }

  async create(input: {
    userId: string | null;
    customerName: string;
    email: string;
    phone: string;
    address: string;
    service: string;
    date: string;
    timeSlot: string;
    notes?: string;
  }): Promise<Order> {
    // orders.code has no unique constraint in the live schema, so verify the
    // generated code is unused before inserting (6-digit space makes a clash
    // rare; the loop covers the residual chance).
    let code = generateOrderCode(input.service);
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data: clash } = await this.db.from("orders").select("id").eq("code", code).maybeSingle();
      if (!clash) break;
      code = generateOrderCode(input.service);
    }
    const now = new Date().toISOString();
    const newOrder = {
      id: randomUUID(),
      code,
      user_id: input.userId,
      customer_name: input.customerName,
      email: input.email,
      phone: input.phone,
      address: input.address,
      service: input.service,
      service_title: SERVICE_TITLES[input.service] ?? input.service,
      date: input.date,
      time_slot: input.timeSlot,
      notes: input.notes ?? null,
      status: "placed",
      status_history: [{ status: "placed", label: "Order Placed", time: now, note: "Booking confirmed" }],
      weight: "TBD",
      price: null,
      rating: null,
      is_new: true,
      created_at: now,
      updated_at: now,
    };
    const { data, error } = await this.db.from("orders").insert(newOrder).select().single();
    if (error) throw error;
    return data as Order;
  }

  async updateStatus(
    id: string,
    status: string,
    note?: string,
    extra?: { itemCount?: number; weight?: string }
  ): Promise<void> {
    // Fetch current status_history
    const { data: current } = await this.db.from("orders").select("status_history").eq("id", id).single();
    const history: StatusEvent[] = current?.status_history ?? [];
    const newEvent: StatusEvent = {
      status,
      label: STATUS_LABELS[status] ?? status,
      time: new Date().toISOString(),
      ...(note ? { note } : {}),
      ...(extra?.itemCount != null ? { itemCount: extra.itemCount } : {}),
    };
    const updatePayload: Record<string, unknown> = {
      status, status_history: [...history, newEvent], updated_at: new Date().toISOString(), is_new: false,
    };
    // Weight is recorded on pickup, when staff actually has the bag on the scale.
    if (extra?.weight) updatePayload.weight = extra.weight;
    const { error } = await this.db.from("orders").update(updatePayload).eq("id", id);
    if (error) throw error;
  }

  async updateRating(id: string, rating: number): Promise<void> {
    const { error } = await this.db.from("orders").update({ rating }).eq("id", id);
    if (error) throw error;
  }

  async acknowledgeOrder(id: string): Promise<void> {
    const { error } = await this.db.from("orders").update({ is_new: false, status: "confirmed", updated_at: new Date().toISOString() }).eq("id", id);
    if (error) throw error;
  }
}
