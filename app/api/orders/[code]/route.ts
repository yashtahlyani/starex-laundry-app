import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { OrderService } from "@/lib/services/order.service";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const orderCode = params.code.trim().toUpperCase();
  const service = new OrderService(getSupabaseAdmin());
  const order = await service.getOrderWithHistory(orderCode);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
