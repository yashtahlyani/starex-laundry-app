import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { OrderRepository } from "@/lib/repositories/order.repository";

export const dynamic = "force-dynamic";

// Admin-only: dismisses a brand-new order from the "needs your confirmation"
// list. Does not advance the pipeline status — that only happens once the
// order is actually picked up.
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getSupabaseAdmin();
  const { data: order } = await db.from("orders").select("id").eq("code", params.code.trim().toUpperCase()).maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    await new OrderRepository(db).acknowledgeOrder(order.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not acknowledge order" }, { status: 500 });
  }
}
