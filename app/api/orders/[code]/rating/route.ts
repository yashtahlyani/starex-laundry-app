import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { notifyOwnerOfLowRating } from "@/lib/notifications";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

// Public (order code is the bearer, same trust model as GET /api/orders/[code])
// — lets a customer rate their own delivered order from the tracking page.
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const allowed = await checkRateLimit(`rate:rating:${clientIp(req)}`, 20, 3600);
  if (!allowed) return NextResponse.json({ error: "Too many requests — please try again later" }, { status: 429 });

  let body: { rating?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const rating = body.rating;
  if (!Number.isInteger(rating) || rating! < 1 || rating! > 5) {
    return NextResponse.json({ error: "rating must be a whole number from 1 to 5" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: order } = await db
    .from("orders")
    .select("id, code, status, rating")
    .eq("code", params.code.trim().toUpperCase())
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "delivered") {
    return NextResponse.json({ error: "You can only rate an order once it's been delivered" }, { status: 400 });
  }
  if (order.rating != null) {
    return NextResponse.json({ error: "This order has already been rated" }, { status: 400 });
  }

  try {
    await new OrderRepository(db).updateRating(order.id, rating!);
    // A rough spot — worth the owner's attention while it's still fresh,
    // rather than only discovering it later while scanning through orders.
    if (rating! <= 2) {
      await notifyOwnerOfLowRating(order.code, rating!).catch(() => {});
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not save rating" }, { status: 500 });
  }
}
