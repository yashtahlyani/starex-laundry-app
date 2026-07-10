"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import {
  Package, LogOut, Plus, Clock, CheckCircle,
  Truck, Sparkles, ArrowRight, MapPin,
} from "lucide-react";

type Order = {
  id: string;
  order_code: string;
  service_type: string;
  status: string;
  pickup_address: string;
  pickup_slot_start: string;
  created_at: string;
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  scheduled:        { label: "Scheduled",       color: "text-mint",         bg: "bg-mint/10",       icon: Clock },
  picked_up:        { label: "Picked Up",        color: "text-yellow-400",   bg: "bg-yellow-400/10", icon: Truck },
  in_progress:      { label: "Being Cleaned",    color: "text-orange-400",   bg: "bg-orange-400/10", icon: Sparkles },
  ready:            { label: "Ready",            color: "text-mint",         bg: "bg-mint/10",       icon: CheckCircle },
  out_for_delivery: { label: "Out for Delivery", color: "text-mint",         bg: "bg-mint/15",       icon: Truck },
  delivered:        { label: "Delivered",        color: "text-white/40",     bg: "bg-white/5",       icon: CheckCircle },
  cancelled:        { label: "Cancelled",        color: "text-red-400",      bg: "bg-red-400/10",    icon: Package },
};

const SERVICE_LABELS: Record<string, string> = {
  "wash-fold": "Wash & Fold",
  "dry-clean": "Dry Cleaning",
  ironing:     "Ironing",
  alteration:  "Alteration",
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/auth"; return; }
      setUser(user);
      const res = await fetch(`/api/dashboard/orders?email=${encodeURIComponent(user.email ?? "")}`);
      if (res.ok) { const data = await res.json(); setOrders(data.orders ?? []); }
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    await getSupabaseBrowser().auth.signOut();
    window.location.href = "/";
  }

  const activeOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const pastOrders = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111921] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-4 border-mint/20 border-t-mint animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm font-body">Loading your orders…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111921] pt-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-sm text-white/35 mb-1 font-body">Welcome back,</p>
            <h1 className="text-2xl font-bold text-white font-heading">
              {user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Customer"}
            </h1>
            <p className="text-sm text-white/30 mt-0.5 font-body">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <a href="/book" className="btn-primary text-sm px-4 py-2">
              <Plus size={14} /> New Booking
            </a>
            <button onClick={handleSignOut} className="btn-ghost text-sm px-4 py-2">
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total Orders",  value: orders.length },
            { label: "Active",        value: activeOrders.length },
            { label: "Completed",     value: orders.filter((o) => o.status === "delivered").length },
            { label: "Member Since",  value: new Date(user?.created_at).toLocaleDateString("en-CA", { month: "short", year: "numeric" }) },
          ].map((s) => (
            <div key={s.label} className="card-dark rounded-2xl p-4 text-center border border-white/8">
              <p className="text-2xl font-bold text-mint font-heading">{s.value}</p>
              <p className="text-xs text-white/35 mt-1 font-body">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Active orders */}
        {activeOrders.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-white font-heading mb-4">Active Orders</h2>
            <div className="space-y-3">
              {activeOrders.map((o) => {
                const meta = STATUS_META[o.status];
                const Icon = meta?.icon ?? Package;
                return (
                  <div key={o.id} className="card-dark rounded-2xl border border-white/8 flex items-center gap-4 p-4">
                    <div className={`h-11 w-11 rounded-xl ${meta?.bg ?? "bg-white/5"} flex items-center justify-center shrink-0`}>
                      <Icon size={20} className={meta?.color ?? "text-white/40"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-mono font-bold text-mint text-sm">{o.order_code}</p>
                        <span className={`badge ${meta?.bg ?? "bg-white/5"} ${meta?.color ?? "text-white/40"}`}>
                          {meta?.label ?? o.status}
                        </span>
                      </div>
                      <p className="text-sm text-white/60 font-body">{SERVICE_LABELS[o.service_type] ?? o.service_type}</p>
                      <p className="text-xs text-white/35 flex items-center gap-1 mt-0.5 font-body">
                        <MapPin size={10} /> {o.pickup_address}
                      </p>
                    </div>
                    <a href={`/order?code=${o.order_code}`} className="btn-ghost text-xs px-3 py-2 shrink-0">
                      Track <ArrowRight size={12} />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {orders.length === 0 && (
          <div className="card-dark rounded-2xl border border-white/8 text-center py-16 px-6">
            <div className="h-16 w-16 rounded-2xl bg-mint/10 flex items-center justify-center mx-auto mb-4">
              <Package size={28} className="text-mint" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading mb-2">No orders yet</h3>
            <p className="text-white/40 text-sm mb-6 max-w-xs mx-auto font-body">
              Book your first pickup and your orders will appear here.
            </p>
            <a href="/book" className="btn-primary">
              Book a Pickup <ArrowRight size={15} />
            </a>
          </div>
        )}

        {/* Past orders */}
        {pastOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white/40 font-heading mb-4">Past Orders</h2>
            <div className="card-dark rounded-2xl border border-white/8 overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 border-b border-white/8">
                    <tr>
                      {["Order", "Service", "Date", "Status", ""].map((h) => (
                        <th key={h} className="text-left px-5 py-3 font-medium text-white/30 text-xs uppercase tracking-wider font-body">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pastOrders.map((o) => {
                      const meta = STATUS_META[o.status];
                      return (
                        <tr key={o.id} className="hover:bg-white/3 transition-colors">
                          <td className="px-5 py-3.5 font-mono font-semibold text-white/40 text-xs">{o.order_code}</td>
                          <td className="px-5 py-3.5 text-white/55 font-body">{SERVICE_LABELS[o.service_type] ?? o.service_type}</td>
                          <td className="px-5 py-3.5 text-white/30 font-body hidden sm:table-cell">
                            {new Date(o.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`badge ${meta?.bg ?? "bg-white/5"} ${meta?.color ?? "text-white/40"}`}>
                              {meta?.label ?? o.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <a href={`/order?code=${o.order_code}`} className="text-xs text-mint hover:underline font-body">
                              View
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
