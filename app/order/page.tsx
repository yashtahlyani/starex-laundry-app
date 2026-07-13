"use client";

import { useState, useEffect } from "react";
import { Package, Search, CheckCircle, Truck, Sparkles, Clock, MapPin, Layers } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

type StatusEvent = { status: string; note?: string | null; time?: string; created_at?: string; label?: string };
type Order = {
  id: string;
  code: string;
  service: string;
  service_title: string;
  status: string;
  address: string;
  date: string;
  time_slot: string;
  created_at: string;
  status_history: StatusEvent[];
};

const STAGES = ["placed", "confirmed", "picked_up", "washing", "folding", "out_for_delivery", "delivered"];

const STAGE_META: Record<string, { label: string; desc: string; icon: React.ElementType; color: string }> = {
  placed:           { label: "Order placed",    desc: "Your order is placed and awaiting confirmation.", icon: Clock,       color: "#A82F4B" },
  confirmed:        { label: "Confirmed",        desc: "We've confirmed your pickup — see you soon!",    icon: CheckCircle, color: "#A82F4B" },
  picked_up:        { label: "Picked up",        desc: "Our driver has collected your laundry.",         icon: Truck,       color: "#C08A00" },
  washing:          { label: "Cleaning",         desc: "Your laundry is being washed and processed.",    icon: Sparkles,    color: "#C2650C" },
  folding:          { label: "Folding",          desc: "Cleaned and carefully folded.",                  icon: Layers,      color: "#7C5FC9" },
  out_for_delivery: { label: "On the way",       desc: "Your order is out for delivery.",                icon: Truck,       color: "#A82F4B" },
  delivered:        { label: "Delivered",        desc: "Your laundry has been delivered. Enjoy!",        icon: CheckCircle, color: "#A82F4B" },
  cancelled:        { label: "Cancelled",        desc: "This order has been cancelled.",                 icon: Package,     color: "#DC2626" },
};

function OrderTracker() {
  const searchParams = useSearchParams();
  const [code,    setCode]    = useState(searchParams.get("code") ?? "");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [order,   setOrder]   = useState<Order | null>(null);

  useEffect(() => {
    const c = searchParams.get("code");
    if (c) { setCode(c); fetchOrder(c); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOrder(trackCode: string) {
    if (!trackCode.trim()) return;
    setLoading(true); setError(null); setOrder(null);
    try {
      const res  = await fetch(`/api/orders/${encodeURIComponent(trackCode.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order not found");
      setOrder(data.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const currentStageIndex = order ? STAGES.indexOf(order.status) : -1;
  const meta = order ? STAGE_META[order.status] : null;
  const events: StatusEvent[] = order?.status_history ?? [];

  return (
    <div className="min-h-screen bg-[#FFFFFF] pt-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-mint/10 mb-4">
            <Package size={26} className="text-[#A82F4B]" />
          </div>
          <h1 className="text-3xl font-bold text-[#161616] font-heading">Track Your Order</h1>
          <p className="text-[#6B6B6B] mt-2 text-sm font-body">Enter your order code from your confirmation.</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl border border-[#161616]/8 shadow-sm p-2 flex gap-2 mb-8">
          <input
            className="flex-1 px-4 py-2.5 text-sm bg-transparent outline-none text-[#161616] placeholder:text-[#8C8C8C] font-body"
            placeholder="Order code — e.g. STX-482913"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchOrder(code)}
          />
          <button className="btn-primary px-5 py-2.5 text-sm shrink-0 disabled:opacity-40"
            onClick={() => fetchOrder(code)} disabled={loading || !code.trim()}>
            {loading
              ? <span className="h-4 w-4 rounded-full border-2 border-[#FFFFFF]/30 border-t-[#FFFFFF] animate-spin" />
              : <><Search size={15} /> Track</>}
          </button>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-100 px-5 py-4 text-sm text-red-700 mb-6 font-body">
            {error} — double-check your order code and try again.
          </div>
        )}

        {order && (
          <div className="space-y-5">
            {/* Status hero card */}
            <div className="card rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs text-[#8C8C8C] font-medium mb-1 font-body">Order</p>
                  <p className="font-mono font-bold text-[#A82F4B] text-xl">{order.code}</p>
                </div>
                {meta && (
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-[#161616]/5 border border-[#161616]/10 text-xs font-semibold font-body"
                    style={{ color: meta.color }}>
                    <meta.icon size={13} />
                    {meta.label}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-6">
                <div className="bg-[#161616]/4 rounded-xl p-3 border border-[#161616]/8">
                  <p className="text-xs text-[#8C8C8C] mb-1 font-body">Service</p>
                  <p className="font-semibold text-[#161616] font-heading">{order.service_title || order.service}</p>
                </div>
                <div className="bg-[#161616]/4 rounded-xl p-3 border border-[#161616]/8">
                  <p className="text-xs text-[#8C8C8C] mb-1 font-body">Pickup date</p>
                  <p className="font-semibold text-[#161616] font-heading">{order.date}</p>
                </div>
                <div className="bg-[#161616]/4 rounded-xl p-3 border border-[#161616]/8 col-span-2">
                  <p className="text-xs text-[#8C8C8C] mb-1 flex items-center gap-1 font-body"><MapPin size={11} /> Address</p>
                  <p className="font-semibold text-[#161616] text-sm font-heading">{order.address}</p>
                </div>
              </div>

              {/* Progress timeline */}
              {order.status !== "cancelled" && (
                <div className="space-y-1">
                  {STAGES.map((stage, i) => {
                    const done   = i <= currentStageIndex;
                    const active = i === currentStageIndex;
                    const sm     = STAGE_META[stage];
                    const Icon   = sm?.icon ?? Package;
                    return (
                      <div key={stage} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            done
                              ? active ? "bg-mint border-mint shadow-[0_0_12px_rgba(203,62,94,0.4)]" : "bg-mint/30 border-mint/40"
                              : "bg-[#161616]/5 border-[#161616]/15"
                          }`}>
                            <Icon size={14} className={done ? "text-[#FFFFFF]" : "text-[#161616]/25"} />
                          </div>
                          {i < STAGES.length - 1 && (
                            <div className={`w-0.5 h-6 mt-1 ${i < currentStageIndex ? "bg-mint/40" : "bg-[#161616]/8"}`} />
                          )}
                        </div>
                        <div className="pb-6 flex-1">
                          <p className={`text-sm font-semibold font-heading ${done ? (active ? "text-[#A82F4B]" : "text-[#161616]/60") : "text-[#161616]/25"}`}>
                            {sm?.label ?? stage}
                          </p>
                          {active && <p className="text-xs text-[#8C8C8C] mt-0.5 font-body">{sm?.desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Event history from status_history jsonb */}
            {events.length > 0 && (
              <div className="card rounded-2xl p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#8C8C8C] mb-4 font-body">Activity Log</p>
                <ul className="space-y-3">
                  {[...events].reverse().map((ev, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-mint/10 flex items-center justify-center mt-0.5 shrink-0">
                        <CheckCircle size={12} className="text-[#A82F4B]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#161616] font-heading">
                          {STAGE_META[ev.status]?.label ?? ev.status}
                        </p>
                        {ev.note && <p className="text-xs text-[#8C8C8C] font-body">{ev.note}</p>}
                        {(ev.time || ev.created_at) && (
                          <p className="text-xs text-[#8C8C8C] mt-0.5 font-body">
                            {new Date(ev.time || ev.created_at!).toLocaleString("en-CA", {
                              month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
                            })}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-center text-xs text-[#8C8C8C] font-body">
              Questions? Email us at{" "}
              <a href="mailto:hello@starexlaundry.ca" className="text-[#A82F4B] underline">hello@starexlaundry.ca</a>
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
