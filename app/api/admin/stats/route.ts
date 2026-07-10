import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { cacheGet, cacheSet } from "@/lib/redis/client";

export const dynamic = "force-dynamic";

const CACHE_KEY = "admin:stats";
const CACHE_TTL_SECONDS = 30;

type AdminStats = {
  orders: { total: number; today: number; thisWeek: number; thisMonth: number; active: number };
  issues: { open: number };
  customers: { total: number };
  contacts: { unread: number };
  statusBreakdown: Record<string, number>;
};

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cached = await cacheGet<AdminStats>(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  const stats = await fetchStats();
  await cacheSet(CACHE_KEY, stats, CACHE_TTL_SECONDS);
  return NextResponse.json(stats);
}

async function fetchStats(): Promise<AdminStats> {
  const db = getSupabaseAdmin();
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    { count: totalOrders },
    { count: todayOrders },
    { count: weekOrders },
    { count: monthOrders },
    { count: activeOrders },
    { count: openIssues },
    { count: totalCustomers },
    { count: newContacts },
    { data: monthlyOrders },
  ] = await Promise.all([
    db.from("orders").select("*", { count: "exact", head: true }),
    db.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
    db.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfWeek.toISOString()),
    db.from("orders").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth.toISOString()),
    db.from("orders").select("*", { count: "exact", head: true }).in("status", ["scheduled", "picked_up", "in_progress", "ready", "out_for_delivery"]),
    db.from("issues").select("*", { count: "exact", head: true }).in("status", ["open", "in_review"]),
    db.from("customers").select("*", { count: "exact", head: true }),
    db.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
    db.from("orders").select("status").gte("created_at", startOfMonth.toISOString()),
  ]);

  const statusBreakdown = (monthlyOrders ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    orders: {
      total: totalOrders ?? 0,
      today: todayOrders ?? 0,
      thisWeek: weekOrders ?? 0,
      thisMonth: monthOrders ?? 0,
      active: activeOrders ?? 0,
    },
    issues: { open: openIssues ?? 0 },
    customers: { total: totalCustomers ?? 0 },
    contacts: { unread: newContacts ?? 0 },
    statusBreakdown,
  };
}
