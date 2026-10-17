import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { enqueueStatusUpdate } from "@/lib/queue/notification.queue";
import { notifyOwnerOfCancellation } from "@/lib/notifications";
import {
  CUSTOMER_CANCELLABLE_STATUSES,
  cancellationTerms,
  cancellationNote,
} from "@/lib/cancellation";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

const stripBOM = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

/**
 * Customer-initiated cancellation of a scheduled pickup.
 *
 * The refund policy already promised this ("You may cancel or reschedule an
 * Order through your account or by contacting us") but nothing on the site
 * did it — a customer emailed to say they couldn't (18 Oct).
 *
 * Authorisation: the order code alone is NOT enough. It's short, it travels
 * over email and WhatsApp, and while the tracking page already reads out an
 * order to anyone holding one, cancelling is a destructive action — a guessed
 * code shouldn't be able to stop a van. So the caller must either be signed
 * in as the account that placed the order, or supply the email address on the
 * order. Both are things the real customer has and a code-guesser doesn't.
 */
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  // Staff are identified before the throttle, not after: the limit exists to
  // make guessing order codes pointless, and a signed-in owner working
  // through a morning's cancellations is not that. Rate-limiting them locked
  // the owner out of his own console after 8 cancellations.
  const staff = await getAdminUser();

  if (!staff) {
    const allowed = await checkRateLimit(`rate:cancel:${clientIp(req)}`, 8, 3600);
    if (!allowed) {
      return NextResponse.json({ error: "Too many cancellation attempts — please call us on 437-607-7251." }, { status: 429 });
    }
  }

  let body: { reason?: string; email?: string };
  try { body = await req.json(); }
  catch { body = {}; }

  const code = params.code.trim().toUpperCase();
  const db = getSupabaseAdmin();
  const { data: order, error } = await db
    .from("orders")
    .select("id, code, status, user_id, customer_name, email, phone, date, time_slot, price, payment_status")
    .eq("code", code)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // --- who is asking -------------------------------------------------------
  let authorised = !!staff;

  if (!authorised) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
      stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
      { cookies: { getAll: () => cookieStore.getAll() } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (user && order.user_id && user.id === order.user_id) {
      authorised = true;
    } else {
      const supplied = (body.email ?? "").trim().toLowerCase();
      if (supplied && supplied === (order.email ?? "").trim().toLowerCase()) authorised = true;
    }
  }

  if (!authorised) {
    // Deliberately the same message whether the email was wrong or absent —
    // this endpoint shouldn't confirm which address is on an order.
    return NextResponse.json(
      { error: "Please confirm the email address on this order to cancel it." },
      { status: 403 }
    );
  }

  // --- can it still be cancelled ------------------------------------------
  if (order.status === "cancelled") {
    return NextResponse.json({ success: true, alreadyCancelled: true, status: "cancelled" });
  }
  if (!staff && !CUSTOMER_CANCELLABLE_STATUSES.includes(order.status)) {
    // Past pickup the garments are physically with Starex — that's a return,
    // not a cancellation, and it needs a human.
    return NextResponse.json(
      {
        error: "This order has already been collected, so it can't be cancelled online. Please call us on 437-607-7251 and we'll sort it out.",
        status: order.status,
      },
      { status: 409 }
    );
  }

  const terms = cancellationTerms(order.date, order.time_slot);
  const note = cancellationNote(terms, body.reason ?? null, staff ? "staff" : "customer");

  try {
    const orders = new OrderRepository(db);
    await orders.updateStatus(order.id, "cancelled", note);

    // Both awaited: on Vercel the function can freeze the moment the response
    // is sent, so an un-awaited notification sends only sometimes. Neither is
    // allowed to fail the cancellation itself.
    await Promise.allSettled([
      enqueueStatusUpdate({
        orderId: order.id,
        orderCode: order.code,
        customerName: order.customer_name,
        customerEmail: order.email,
        customerPhone: order.phone,
        newStatus: "cancelled",
        note,
      }),
      notifyOwnerOfCancellation({
        orderCode: order.code,
        customerName: order.customer_name,
        customerPhone: order.phone,
        pickupDate: order.date,
        pickupTimeSlot: order.time_slot,
        cancelledBy: staff ? "staff" : "customer",
        band: terms.band,
        hoursNotice: terms.hoursNotice,
        reason: body.reason ?? null,
        priceCad: order.price != null ? Number(order.price) : null,
        paid: order.payment_status === "paid",
      }),
    ]);

    return NextResponse.json({ success: true, status: "cancelled", terms, note });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not cancel this order" }, { status: 500 });
  }
}
