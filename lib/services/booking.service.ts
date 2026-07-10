import type { SupabaseClient } from "@supabase/supabase-js";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { CustomerRepository } from "@/lib/repositories/customer.repository";
import { generateOrderCode } from "@/lib/orderCode";
import { estimateOrderAmountCents } from "@/lib/pricing";
import { stripe, isStripeConfigured } from "@/lib/stripe";
import { enqueueBookingConfirmation } from "@/lib/queue/notification.queue";

export interface BookingInput {
  serviceId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  pickupSlotStart: string;
  pickupSlotEnd: string;
  notes?: string;
}

export interface BookingResult {
  orderCode: string;
  orderId: string;
  clientSecret: string | null;
}

const MAX_CODE_ATTEMPTS = 5;
const PG_UNIQUE_VIOLATION = "23505";

export class BookingService {
  private readonly orders: OrderRepository;
  private readonly customers: CustomerRepository;

  constructor(db: SupabaseClient) {
    this.orders = new OrderRepository(db);
    this.customers = new CustomerRepository(db);
  }

  async createBooking(input: BookingInput): Promise<BookingResult> {
    const customer = await this.customers.upsert({
      full_name: input.name,
      email: input.email,
      phone: input.phone,
    });

    const order = await this.createOrderWithRetry(customer.id, input);

    await this.orders.appendStatusEvent(order.id, "scheduled", "Booking created", "system");

    // Push to BullMQ — the worker handles retries with exponential backoff,
    // so a transient Resend/Twilio outage doesn't silently drop the confirmation.
    await enqueueBookingConfirmation({
      orderId: order.id,
      orderCode: order.order_code,
      customerName: input.name,
      customerEmail: input.email,
      customerPhone: input.phone,
      serviceType: input.serviceId,
      pickupSlotStart: input.pickupSlotStart,
      pickupSlotEnd: input.pickupSlotEnd,
      pickupAddress: input.address,
    });

    const clientSecret = await this.createStripeIntent(
      order.id,
      order.order_code,
      input.email,
      input.serviceId
    );

    return { orderCode: order.order_code, orderId: order.id, clientSecret };
  }

  private async createOrderWithRetry(customerId: string, input: BookingInput) {
    let lastError: unknown;
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      try {
        return await this.orders.create({
          order_code: generateOrderCode(),
          customer_id: customerId,
          service_type: input.serviceId,
          pickup_address: input.address,
          postal_code: input.postalCode,
          pickup_slot_start: input.pickupSlotStart,
          pickup_slot_end: input.pickupSlotEnd,
          status: "scheduled",
          notes: input.notes ?? null,
          stripe_payment_intent_id: null,
          price_estimate_cents: null,
        });
      } catch (err: any) {
        lastError = err;
        if (err?.code !== PG_UNIQUE_VIOLATION) throw err; // non-collision error — don't retry
      }
    }
    throw lastError;
  }

  private async createStripeIntent(
    orderId: string,
    orderCode: string,
    email: string,
    serviceId: string
  ): Promise<string | null> {
    if (!isStripeConfigured()) return null;
    const amountCents = estimateOrderAmountCents(serviceId);
    const intent = await stripe!.paymentIntents.create({
      amount: amountCents,
      currency: "cad",
      capture_method: "manual",
      receipt_email: email,
      metadata: { order_id: orderId, order_code: orderCode },
    });
    await this.orders.updatePaymentIntent(orderId, intent.id, amountCents);
    return intent.client_secret;
  }
}
