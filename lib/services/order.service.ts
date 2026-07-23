import type { SupabaseClient } from "@supabase/supabase-js";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { CustomerRepository } from "@/lib/repositories/customer.repository";

// Simplified per client request (2026-07-23): "In Process" and "Payment
// Pending" were dropped as separate manual stages the owner had to click
// through — neither is a distinct physical checkpoint worth a click. Payment
// is now tracked independently via orders.payment_status (see
// OrderRepository.markPaid), not as a status in this pipeline, and an order
// auto-advances to "delivered" the moment payment clears on an order that's
// already Ready for Delivery.
export const VALID_STATUSES = [
  "placed", "confirmed", "picked_up",
  "ready_for_delivery", "delivered", "cancelled",
] as const;

export type OrderStatus = (typeof VALID_STATUSES)[number];

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed:              ["confirmed", "cancelled"],
  confirmed:           ["picked_up", "cancelled"],
  picked_up:           ["ready_for_delivery", "cancelled"],
  ready_for_delivery:  ["delivered", "cancelled"],
  delivered:           [],
  cancelled:           [],
};

export class OrderService {
  private readonly orders: OrderRepository;
  private readonly customers: CustomerRepository;

  constructor(db: SupabaseClient) {
    this.orders = new OrderRepository(db);
    this.customers = new CustomerRepository(db);
  }

  async updateStatus(
    orderCode: string,
    newStatus: OrderStatus,
    note: string | null,
    extra?: { itemCount?: number; weight?: string }
  ) {
    const order = await this.orders.findByCode(orderCode);
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });

    const currentStatus = order.status as OrderStatus;
    if (currentStatus === newStatus) return { unchanged: true as const };

    if (!TRANSITIONS[currentStatus]?.includes(newStatus)) {
      throw Object.assign(
        new Error(`Cannot transition from '${currentStatus}' to '${newStatus}'`),
        { statusCode: 422 }
      );
    }

    await this.orders.updateStatus(order.id, newStatus, note ?? undefined, extra);
    return {
      unchanged: false as const,
      orderCode,
      status: newStatus,
      orderId: order.id,
      customerName: order.customer_name,
      customerEmail: order.email,
      customerPhone: order.phone,
    };
  }

  async getOrderWithHistory(orderCode: string) {
    return this.orders.findByCode(orderCode);
  }

  async getOrdersByUserId(userId: string) {
    return this.orders.findByUserId(userId);
  }

  async getOrdersByEmail(email: string) {
    const profile = await this.customers.findByEmail(email);
    if (!profile) return [];
    return this.orders.findByUserId(profile.id);
  }

  async getAllOrdersForAdmin() {
    return this.orders.findAllForAdmin();
  }
}
