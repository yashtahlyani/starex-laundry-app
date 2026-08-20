import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { OrderRepository } from "@/lib/repositories/order.repository";
import { MINIMUM_ORDER } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// Admin-only: confirms the final weighed/counted order total without taking
// payment — this is what unlocks "Pay Now" on the customer's own tracking
// page, so the customer can pay online themselves instead of the owner
// having to charge or collect it in person.
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { amountCad?: number };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const amountCad = body.amountCad;
  if (typeof amountCad !== "number" || !Number.isFinite(amountCad) || amountCad <= 0) {
    return NextResponse.json({ error: "amountCad must be a positive number" }, { status: 400 });
  }

  const db = getSupabaseAdmin();
  const { data: order } = await db.from("orders").select("id, service").eq("code", params.code.trim().toUpperCase()).maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const minimum = order.service === "detailing" ? MINIMUM_ORDER.detailingCad : MINIMUM_ORDER.standardCad;
  if (amountCad < minimum) {
    return NextResponse.json({ error: `Order total can't be below the $${minimum} minimum order value` }, { status: 400 });
  }

  try {
    await new OrderRepository(db).setPrice(order.id, amountCad);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Could not save order total" }, { status: 500 });
  }
}
