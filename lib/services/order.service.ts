import type { SupabaseClient } from "@supabase/supabase-js";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { CustomerRepository } from "@/lib/repositories/customer.repository";
import { enqueueStatusUpdate } from "@/lib/queue/notification.queue";
import { cacheInvalidate } from "@/lib/redis/client";

export const VALID_STATUSES = [
  "scheduled",
  "picked_up",
  "in_progress",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof VALID_STATUSES)[number];

// Allowed status transitions — prevents illogical moves like delivered → scheduled
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  scheduled:        ["picked_up", "cancelled"],
  picked_up:        ["in_progress", "cancelled"],
  in_progress:      ["ready", "cancelled"],
  ready:            ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered:        [],
  cancelled:        [],
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
    adminEmail: string
  ) {
    const order = await this.orders.findByCodeWithCustomer(orderCode);
    if (!order) throw Object.assign(new Error("Order not found"), { statusCode: 404 });

    const currentStatus = order.status as OrderStatus;
    if (currentStatus === newStatus) return { unchanged: true };

    if (!TRANSITIONS[currentStatus]?.includes(newStatus)) {
      throw Object.assign(
        new Error(`Cannot transition from '${currentStatus}' to '${newStatus}'`),
        { statusCode: 422 }
      );
    }

    await this.orders.updateStatus(order.id, newStatus);
    await this.orders.appendStatusEvent(order.id, newStatus, note, adminEmail);

    // Bust the per-order cache so the tracking page sees the new status immediately
    await cacheInvalidate(`order:${orderCode}`);

    const customer = order.customers;
    if (customer) {
      await enqueueStatusUpdate({
        orderId: order.id,
        orderCode,
        customerName: customer.full_name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        newStatus,
      });
    }

    return { unchanged: false, orderCode, status: newStatus };
  }

  async getOrderWithEvents(orderCode: string) {
    const order = await this.orders.findByCode(orderCode);
    if (!order) return null;
    const events = await this.orders.getStatusEvents(order.id);
    return { order, events };
  }

  async getOrdersByEmail(email: string) {
    const customer = await this.customers.findByEmail(email);
    if (!customer) return [];
    return this.orders.findByCustomerId(customer.id);
  }
}
