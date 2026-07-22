import type { SupabaseClient } from "@supabase/supabase-js";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { CustomerRepository } from "@/lib/repositories/customer.repository";

export interface BookingInput {
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  service: string;
  date: string;
  timeSlot: string;
  notes?: string;
  stripeCustomerId?: string;
  stripePaymentMethodId?: string;
  cardBrand?: string;
  cardLast4?: string;
}

export interface BookingResult {
  orderCode: string;
  orderId: string;
}

export class BookingService {
  private readonly orders: OrderRepository;
  private readonly customers: CustomerRepository;

  constructor(db: SupabaseClient) {
    this.orders = new OrderRepository(db);
    this.customers = new CustomerRepository(db);
  }

  async createBooking(input: BookingInput): Promise<BookingResult> {
    // Only signed-in users have a profile row (profiles.id = auth.uid) — guests
    // skip this and their contact details live on the order row itself.
    if (input.userId) {
      await this.customers.upsert({ id: input.userId, name: input.name, email: input.email, phone: input.phone });
    }

    const order = await this.orders.create({
      userId: input.userId,
      customerName: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address,
      service: input.service,
      date: input.date,
      timeSlot: input.timeSlot,
      notes: input.notes,
      stripeCustomerId: input.stripeCustomerId,
      stripePaymentMethodId: input.stripePaymentMethodId,
      cardBrand: input.cardBrand,
      cardLast4: input.cardLast4,
    });

    return { orderCode: order.code, orderId: order.id };
  }
}
