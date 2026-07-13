"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { getSupabaseBrowser } from "@/lib/supabaseClient";
import { Package, LogOut, Plus, Clock, Star, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { StatusBadge, ProgressTrack, STATUS_META, fmtSlot } from "@/components/OrderBits";
import AppOrderDrawer, { type DrawerOrder } from "@/components/AppOrderDrawer";

const ease = [0.25, 0.4, 0.25, 1] as const;

const ACTIVE_PRIORITY: Record<string, number> = {
  washing: 0, folding: 0, out_for_delivery: 0, picked_up: 1, confirmed: 2, placed: 3,
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
const today = new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<DrawerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DrawerOrder | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { window.location.href = "/auth"; return; }
      setUser(user);
      const res = await fetch("/api/dashboard/orders");
      if (res.ok) { const data = await res.json(); setOrders(data.orders ?? []); }
      setLoading(false);
    });
  }, []);

  async function handleSignOut() {
    await getSupabaseBrowser().auth.signOut();
    window.location.href = "/";
  }

  const active = useMemo(() => orders.filter(o => !["delivered", "cancelled"].includes(o.status)), [orders]);
  const activeOrder = useMemo(() =>
    [...active].sort((a, b) => (ACTIVE_PRIORITY[a.status] ?? 4) - (ACTIVE_PRIORITY[b.status] ?? 4))[0] ?? null
  , [active]);
  const recent = orders.slice(0, 5);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0]
    ?? user?.user_metadata?.name?.split(" ")[0]
    ?? user?.email?.split("@")[0] ?? "there";
  const initial = firstName.charAt(0).toUpperCase();

  const statCards = [
    { label: "Total orders", value: orders.length, icon: Package },
    { label: "Active now", value: active.length, icon: Clock },
    { label: "Services used", value: new Set(orders.map(o => o.service)).size, icon: Sparkles },
    { label: "Member since", value: user ? new Date(user.created_at).toLocaleDateString("en-CA", { month: "short", year: "numeric" }) : "—", icon: Star },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#FDFBFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid rgba(206,66,87,0.2)", borderTopColor: "#CE4257", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#A1A1AA", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>Loading your orders…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{ background: "#FDFBFA", minHeight: "100vh", paddingTop: 96 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 96px" }}>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#DE6E7A,#CE4257)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.2rem", color: "#3F252C" }}>{initial}</div>
            <div>
              <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.55rem", color: "#1F1B1B", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{greeting()}, {firstName}.</h1>
              <p style={{ color: "#857C78", fontSize: "0.875rem", fontFamily: "Kodchasan, sans-serif" }}>{today}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", textDecoration: "none" }}>
              <Plus size={16} /> Schedule pickup
            </a>
            <button onClick={handleSignOut} className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px" }}>
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 32 }} className="dash-stats">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 + i * 0.05, duration: 0.4, ease }}
              style={{ background: "#fff", border: "1px solid #EDEDED", borderRadius: 16, padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <s.icon size={15} color="#CE4257" />
                <span style={{ color: "#857C78", fontSize: "0.78rem", fontFamily: "Kodchasan, sans-serif" }}>{s.label}</span>
              </div>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.6rem", color: "#1F1B1B", letterSpacing: "-0.02em" }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {activeOrder ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45, ease }} style={{ marginBottom: 32 }}>
            <p className="eyebrow" style={{ marginBottom: 12 }}>Active order</p>
            <div style={{ background: "#fff", border: "1.5px solid #DE6E7A", borderRadius: 20, padding: "28px 30px", boxShadow: "0 4px 20px rgba(206,66,87,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#1F1B1B" }}>{activeOrder.code}</span>
                    <StatusBadge status={activeOrder.status} pulse />
                  </div>
                  <p style={{ color: "#857C78", fontSize: "0.85rem", fontFamily: "Kodchasan, sans-serif", marginTop: 4 }}>
                    {activeOrder.service_title ?? activeOrder.service} · {activeOrder.date}
                  </p>
                </div>
                <button onClick={() => setSelected(activeOrder)} className="btn-ghost" style={{ padding: "9px 18px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  View details <ChevronRight size={14} />
                </button>
              </div>
              <ProgressTrack status={activeOrder.status} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#A1A1AA" }}>{STATUS_META[activeOrder.status]?.label}</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.45, ease }}
            style={{ background: "#1F1B1B", borderRadius: 20, padding: "40px", textAlign: "center", marginBottom: 32, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 80% at 50% 0%, #3F252C 0%, #1F1B1B 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.5rem", color: "#fff", marginBottom: 8 }}>
                No active orders — <em className="display-accent" style={{ display: "inline" }}>enjoy your weekend.</em>
              </h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Kodchasan, sans-serif", marginBottom: 24 }}>Schedule a pickup and we&apos;ll handle the rest.</p>
              <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                Book a pickup <ArrowRight size={16} />
              </a>
            </div>
          </motion.div>
        )}

        {recent.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45, ease }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <p className="eyebrow" style={{ margin: 0 }}>Recent orders</p>
              {orders.length > 5 && (
                <a href="/order" style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.82rem", color: "#A63446", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  View all <ChevronRight size={13} />
                </a>
              )}
            </div>
            <div style={{ background: "#fff", border: "1px solid #EDEDED", borderRadius: 16, overflow: "hidden" }}>
              {recent.map((o, i) => (
                <button key={o.id} onClick={() => setSelected(o)} style={{
                  width: "100%", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 16, alignItems: "center",
                  padding: "16px 22px", borderBottom: i < recent.length - 1 ? "1px solid #F4F4F5" : "none",
                  borderLeft: "none", borderRight: "none", borderTop: "none",
                  background: "none", cursor: "pointer", textAlign: "left",
                }}>
                  <div>
                    <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#1F1B1B" }}>
                      {o.service_title ?? o.service}
                      <span style={{ color: "#A1A1AA", fontWeight: 400 }}> · {o.code}</span>
                    </p>
                    <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.78rem", color: "#A1A1AA" }}>{o.date}</p>
                  </div>
                  <StatusBadge status={o.status} size="sm" pulse={!["delivered","cancelled"].includes(o.status)} />
                  <ChevronRight size={15} color="#C0C0C0" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {orders.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ background: "#fff", borderRadius: 20, padding: "64px 40px", textAlign: "center", border: "1px solid #EDEDED" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(206,66,87,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Package size={24} color="#A63446" />
            </div>
            <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "1.25rem", color: "#1F1B1B", marginBottom: 8 }}>No orders yet</h3>
            <p style={{ color: "#857C78", fontFamily: "Kodchasan, sans-serif", marginBottom: 24 }}>Book your first pickup — it takes under 2 minutes.</p>
            <a href="/book" className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              Book a pickup <ArrowRight size={16} />
            </a>
          </motion.div>
        )}
      </div>

      <AppOrderDrawer order={selected} onClose={() => setSelected(null)} />
      <style>{`@media (max-width: 720px) { .dash-stats { grid-template-columns: repeat(2,1fr) !important; } }`}</style>
    </div>
  );
}
