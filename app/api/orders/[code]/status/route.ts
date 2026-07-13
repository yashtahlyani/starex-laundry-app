import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { OrderService, VALID_STATUSES, type OrderStatus } from "@/lib/services/order.service";
import { enqueueStatusUpdate } from "@/lib/queue/notification.queue";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { code: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { status: string; note?: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const newStatus = body.status as OrderStatus;
  if (!VALID_STATUSES.includes(newStatus)) {
    return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
  }

  try {
    const service = new OrderService(getSupabaseAdmin());
    const result = await service.updateStatus(params.code.trim().toUpperCase(), newStatus, body.note ?? null);
    if (result.unchanged) return NextResponse.json({ message: "Status unchanged" });

    enqueueStatusUpdate({
      orderId: result.orderId,
      orderCode: result.orderCode,
      customerName: result.customerName,
      customerEmail: result.customerEmail,
      customerPhone: result.customerPhone,
      newStatus: result.status,
    }).catch(() => {});

    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.statusCode ?? 500 });
  }
}
