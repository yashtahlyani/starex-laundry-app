"use client";

import { useState, useEffect } from "react";
import { Package, Search, CheckCircle, Truck, Sparkles, Clock, MapPin } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import IssueReportForm from "@/components/IssueReportForm";

type OrderStatusEvent = { status: string; note: string | null; created_at: string };
type Order = {
  order_code: string;
  service_type: string;
  status: string;
  pickup_address: string;
  pickup_slot_start: string;
  pickup_slot_end: string;
  created_at: string;
};

const STAGES = ["scheduled", "picked_up", "in_progress", "ready", "out_for_delivery", "delivered"];

const STAGE_META: Record<string, { label: string; desc: string; icon: React.ElementType; color: string }> = {
  scheduled:        { label: "Scheduled",          desc: "Pickup is booked and confirmed.",                icon: Clock,       color: "text-mint" },
  picked_up:        { label: "Picked Up",           desc: "Our driver has collected your laundry.",        icon: Truck,       color: "text-yellow-400" },
  in_progress:      { label: "Being Cleaned",       desc: "Your laundry is being washed and processed.",  icon: Sparkles,    color: "text-orange-400" },
  ready:            { label: "Ready for Delivery",  desc: "Cleaned and packaged — driver is next!",       icon: Package,     color: "text-purple-400" },
  out_for_delivery: { label: "Out for Delivery",    desc: "Your order is on its way back to you.",        icon: Truck,       color: "text-mint" },
  delivered:        { label: "Delivered",           desc: "Your laundry has been delivered. Enjoy!",      icon: CheckCircle, color: "text-mint" },
  cancelled:        { label: "Cancelled",           desc: "This order has been cancelled.",               icon: Package,     color: "text-red-400" },
};

const SERVICE_LABELS: Record<string, string> = {
  "wash-fold": "Wash & Fold",
  "dry-clean": "Dry Cleaning",
  ironing:     "Ironing",
  alteration:  "Alteration",
};

function OrderTracker() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [events, setEvents] = useState<OrderStatusEvent[]>([]);

  useEffect(() => {
    const c = searchParams.get("code");
    if (c) { setCode(c); fetchOrder(c); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrder(trackCode: string) {
    if (!trackCode.trim()) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trackCode.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");
      setOrder(data.order);
      setEvents(data.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const currentStageIndex = order ? STAGES.indexOf(order.status) : -1;
  const meta = order ? STAGE_META[order.status] : null;

  return (
    <div className="min-h-screen bg-[#111921] pt-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10 mb-4">
            <Package size={26} className="text-mint" />
          </div>
          <h1 className="text-3xl font-bold text-white font-heading">Track Your Order</h1>
          <p className="text-white/45 mt-2 text-sm font-body">Enter your order ID from your confirmation email or WhatsApp.</p>
        </div>

        {/* Search */}
        <div className="bg-[#1a2332] rounded-2xl border border-white/8 p-2 flex gap-2 mb-8">
          <input
            className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-white placeholder:text-white/30 font-body"
            placeholder="Enter Order ID — e.g. STX-482913"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchOrder(code)}
          />
          <button
            className="btn-primary px-5 py-2.5 text-sm shrink-0 disabled:opacity-40"
            onClick={() => fetchOrder(code)}
            disabled={loading || !code.trim()}
          >
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-[#0a1a0f]/30 border-t-[#0a1a0f] animate-spin" />
            ) : (
              <><Search size={15} /> Track</>
            )}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-900/30 border border-red-500/30 px-5 py-4 text-sm text-red-300 mb-6 font-body">
            {error} — double-check your order ID and try again.
          </div>
        )}

        {order && (
          <div className="space-y-5">
            {/* Status hero card */}
            <div className="card-dark rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs text-white/35 font-medium mb-1 font-body">Order</p>
                  <p className="font-mono font-bold text-mint text-xl">{order.order_code}</p>
                </div>
                {meta && (
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-white/5 border border-white/10 text-xs font-semibold font-body ${meta.color}`}>
                    <meta.icon size={13} />
                    {meta.label}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                  <p className="text-xs text-white/35 mb-1 font-body">Service</p>
                  <p className="font-semibold text-white font-heading">{SERVICE_LABELS[order.service_type] ?? order.service_type}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/8">
                  <p className="text-xs text-white/35 mb-1 font-body">Booked</p>
                  <p className="font-semibold text-white font-heading">
                    {new Date(order.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="bg-white/5 rounded-xl p-3 border border-white/8 col-span-2">
                  <p className="text-xs text-white/35 mb-1 flex items-center gap-1 font-body">
                    <MapPin size={11} /> Address
                  </p>
                  <p className="font-semibold text-white text-sm font-heading">{order.pickup_address}</p>
                </div>
              </div>

              {/* Progress timeline */}
              {order.status !== "cancelled" && (
                <div className="space-y-1">
                  {STAGES.map((stage, i) => {
                    const done = i <= currentStageIndex;
                    const active = i === currentStageIndex;
                    const stageMeta = STAGE_META[stage];
                    const StageIcon = stageMeta?.icon ?? Package;

                    return (
                      <div key={stage} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            done
                              ? active
                                ? "bg-mint border-mint shadow-[0_0_12px_rgba(120,237,178,0.4)]"
                                : "bg-mint/30 border-mint/40"
                              : "bg-white/5 border-white/15"
                          }`}>
                            <StageIcon size={14} className={done ? "text-[#0a1a0f]" : "text-white/20"} />
                          </div>
                          {i < STAGES.length - 1 && (
                            <div className={`w-0.5 h-6 mt-1 ${i < currentStageIndex ? "bg-mint/40" : "bg-white/8"}`} />
                          )}
                        </div>
                        <div className="pb-6 flex-1">
                          <p className={`text-sm font-semibold font-heading ${done ? (active ? "text-mint" : "text-white/60") : "text-white/20"}`}>
                            {stageMeta?.label ?? stage}
                          </p>
                          {active && (
                            <p className="text-xs text-white/40 mt-0.5 font-body">{stageMeta?.desc}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Event history */}
            {events.length > 0 && (
              <div className="card-dark rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-white/30 mb-4 font-body">Activity Log</p>
                <ul className="space-y-3">
                  {[...events].reverse().map((ev, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-mint/10 flex items-center justify-center mt-0.5 shrink-0">
                        <CheckCircle size={12} className="text-mint" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white font-heading">
                          {STAGE_META[ev.status]?.label ?? ev.status}
                        </p>
                        {ev.note && <p className="text-xs text-white/40 font-body">{ev.note}</p>}
                        <p className="text-xs text-white/30 mt-0.5 font-body">
                          {new Date(ev.created_at).toLocaleString("en-CA", {
                            month: "short", day: "numeric",
                            hour: "numeric", minute: "2-digit", hour12: true,
                          })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {order.status !== "cancelled" && (
              <IssueReportForm orderCode={order.order_code} />
            )}

            <p className="text-center text-xs text-white/25 font-body">
              Questions? Email us at{" "}
              <a href="mailto:hello@starexlaundry.ca" className="text-mint underline">
                hello@starexlaundry.ca
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense>
      <OrderTracker />
    </Suspense>
  );
}
