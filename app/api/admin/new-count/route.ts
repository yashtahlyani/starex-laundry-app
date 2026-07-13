import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Lightweight polling target for the admin console's live "new orders" badge.
// True Postgres realtime isn't available (the orders table isn't in this
// project's supabase_realtime publication, which needs dashboard/SQL access),
// so the console polls this instead — a single fast head-count query.
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { count } = await getSupabaseAdmin()
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "placed");

  return NextResponse.json({ count: count ?? 0 });
}
