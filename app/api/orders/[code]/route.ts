import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { OrderService } from "@/lib/services/order.service";
import { checkRateLimit, clientIp } from "@/lib/redis/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  // This endpoint returns customer PII for anyone holding the order code, so
  // throttle lookups to keep the code space from being enumerable.
  const allowed = await checkRateLimit(`rate:track:${clientIp(req)}`, 30, 300);
  if (!allowed) return NextResponse.json({ error: "Too many requests — try again in a few minutes" }, { status: 429 });

  const orderCode = params.code.trim().toUpperCase();
  const service = new OrderService(getSupabaseAdmin());
  const order = await service.getOrderWithHistory(orderCode);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
