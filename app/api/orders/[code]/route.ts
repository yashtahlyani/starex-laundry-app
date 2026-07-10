import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { OrderService } from "@/lib/services/order.service";
import { cacheGet, cacheSet } from "@/lib/redis/client";

export const dynamic = "force-dynamic";

const CACHE_TTL_SECONDS = 15;

export async function GET(_req: NextRequest, { params }: { params: { code: string } }) {
  const orderCode = params.code.trim().toUpperCase();
  const cacheKey = `order:${orderCode}`;

  const cached = await cacheGet<{ order: unknown; events: unknown[] }>(cacheKey);
  if (cached) return NextResponse.json(cached);

  const service = new OrderService(getSupabaseAdmin());
  const result = await service.getOrderWithEvents(orderCode);

  if (!result) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  await cacheSet(cacheKey, result, CACHE_TTL_SECONDS);
  return NextResponse.json(result);
}
