import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { notifyOwnerOfNewContact } from "@/lib/notifications";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";
import { calculateHst } from "@/lib/pricing";
import { ETRANSFER } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * "I've sent the e-Transfer."
 *
 * Interac e-Transfer is offered alongside card at payment time (per client,
 * 2026-11-07). The money moves between the customer's bank and the
 * business's inbox, entirely outside this system — we are never told when it
 * lands.
 *
 * So this deliberately does NOT mark the order paid. It only tells the owner
 * to go and look. Marking an order paid on a customer's say-so would let
 * anyone with an order code clear their own balance, and would put "Payment
 * received" in front of staff for money that may never arrive. The owner
 * confirms it in the admin once the transfer is actually in the account,
 * using the Mark Paid button that already exists.
 *
 * The order code alone is enough to call this: the worst a stranger can
 * achieve is making the owner check an account for a payment that is not
 * there. Rate-limited so it cannot be used to flood the inbox.
 */
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  if (!ETRANSFER.enabled) {
    return NextResponse.json({ error: "e-Transfer is not available." }, { status: 400 });
  }

  const staff = await getAdminUser();
  if (!staff) {
    const allowed = await checkRateLimit(`rate:etransfer:${clientIp(req)}`, 10, 3600);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts — please call us on 437-607-7251." },
        { status: 429 }
      );
    }
  }

  const code = decodeURIComponent(params.code);

  let body: { deliveryRequest?: string } = {};
  try { body = await req.json(); } catch { /* optional */ }

  try {
    const db = getSupabaseAdmin();
    const { data: rows } = await db
      .from("orders")
      .select("id, code, customer_name, email, phone, price, payment_status, status, status_history")
      .eq("code", code)
      .limit(1);

    const order = rows?.[0];
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    // Already settled — tell the customer rather than bothering the owner.
    if (order.payment_status === "paid") {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    const total = order.price != null ? calculateHst(Number(order.price)).total : null;
    const delivery = (body.deliveryRequest ?? "").trim();

    // Recorded on the order so staff see it in the Activity Log next to the
    // order itself, not only in an email that can be missed.
    const history = Array.isArray(order.status_history) ? order.status_history : [];
    await db
      .from("orders")
      .update({
        status_history: [
          ...history,
          {
            status: order.status,
            label: "Customer says e-Transfer sent",
            time: new Date().toISOString(),
            note: `Awaiting confirmation. ${total != null ? `Expected $${total.toFixed(2)} CAD. ` : ""}`
              + `Sent to ${ETRANSFER.email}.${delivery ? ` Delivery requested: ${delivery}.` : ""}`,
          },
        ],
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    await notifyOwnerOfNewContact({
      name: order.customer_name ?? "Customer",
      email: order.email ?? "",
      subject: `e-Transfer sent — order ${order.code}${total != null ? ` ($${total.toFixed(2)})` : ""}`,
      message:
        `${order.customer_name ?? "A customer"} says they have sent an Interac e-Transfer for order ${order.code}.\n\n`
        + `Amount expected: ${total != null ? `$${total.toFixed(2)} CAD (incl. HST)` : "not yet priced"}\n`
        + `Sent to: ${ETRANSFER.email}\n`
        + `Customer: ${order.email ?? "—"} · ${order.phone ?? "—"}\n`
        + (delivery ? `Delivery requested: ${delivery}\n` : "")
        + `\nThis order is still marked UNPAID. Check the account, and mark it paid in the admin once the transfer has arrived.`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not record that. Please call us on 437-607-7251." }, { status: 500 });
  }
}
