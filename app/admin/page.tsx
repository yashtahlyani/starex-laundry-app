import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import StatusUpdater from "@/components/StatusUpdater";
import AdminTabs from "@/components/AdminTabs";
import ContactUpdater from "@/components/ContactUpdater";
import { AdminIncomingSection, AdminOrderTable } from "@/components/AdminOrdersClient";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  placed:           "bg-blue-50 text-blue-700",
  confirmed:        "bg-teal-50 text-teal-700",
  picked_up:        "bg-yellow-100 text-yellow-800",
  washing:          "bg-orange-50 text-orange-700",
  folding:          "bg-purple-50 text-purple-700",
  out_for_delivery: "bg-green-50 text-green-700",
  delivered:        "bg-gray-100 text-gray-500",
  cancelled:        "bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  placed:           "Placed",
  confirmed:        "Confirmed",
  picked_up:        "Picked Up",
  washing:          "Cleaning",
  folding:          "Folding",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-CA", {
    timeZone: "America/Toronto", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  await requireAdmin();
  const db  = getSupabaseAdmin();
  const tab = searchParams.tab ?? "orders";
  const q   = searchParams.q?.toLowerCase() ?? "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ACTIVE_STATUSES = ["placed", "confirmed", "picked_up", "washing", "folding", "out_for_delivery"];

  const [
    { data: activeOrders },
    { data: pastOrders },
    { data: contacts },
    { count: totalOrders },
    { count: activeCount },
    { count: newContacts },
    { count: totalCustomers },
    { count: todayOrders },
  ] = await Promise.all([
    db.from("orders")
      .select("id, code, customer_name, email, phone, service, service_title, status, address, date, time_slot, notes, weight, price, rating, status_history, created_at")
      .in("status", ACTIVE_STATUSES)
      .order("created_at", { ascending: false }),
    db.from("orders")
      .select("id, code, customer_name, email, phone, service, service_title, status, address, date, time_slot, created_at")
      .in("status", ["delivered", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(40),
    db.from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
    db.from("orders").select("*", { count: "exact", head: true }),
    db.from("orders").select("*", { count: "exact", head: true }).in("status", ACTIVE_STATUSES),
    db.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
  ]);

  const newOrders    = (activeOrders ?? []).filter((o: any) => o.status === "placed");
  const inProgressOrders = (activeOrders ?? []).filter((o: any) => o.status !== "placed");

  const filteredActive = q
    ? (activeOrders ?? []).filter((o: any) =>
        o.code?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q)
      )
    : (activeOrders ?? []);

  const kpis = [
    { label: "New orders",   value: newOrders.length, accent: newOrders.length > 0 },
    { label: "In progress",  value: inProgressOrders.length, accent: false },
    { label: "Orders today", value: todayOrders ?? 0, accent: false },
    { label: "Total orders", value: totalOrders ?? 0, accent: false },
    { label: "Customers",    value: totalCustomers ?? 0, accent: false },
    { label: "Messages",     value: newContacts ?? 0, accent: false },
  ];

  return (
    <div style={{ background: "#F4F5F7", minHeight: "100vh" }}>

      {/* Admin header */}
      <header style={{ background: "#161616", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="9" fill="#161616" />
              <line x1="9" y1="9" x2="27" y2="27" stroke="#CB3E5E" strokeWidth="5" strokeLinecap="round" />
              <line x1="27" y1="9" x2="9" y2="27" stroke="#CB3E5E" strokeWidth="5" strokeLinecap="round" />
              <circle cx="18" cy="18" r="3" fill="#161616" /><circle cx="18" cy="18" r="1.5" fill="#DA6178" />
            </svg>
            <div>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1rem", color: "#fff", lineHeight: 1 }}>StareX</p>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.68rem", color: "#CB3E5E", letterSpacing: "0.08em", textTransform: "uppercase" }}>Owner console</p>
            </div>
            {newOrders.length > 0 && (
              <span style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 6, background: "#CB3E5E", color: "#FFFFFF", borderRadius: 999, padding: "4px 12px", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.75rem" }}>
                <Bell size={12} /> {newOrders.length} new
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontFamily: "Kodchasan, sans-serif", fontSize: "0.82rem", padding: "8px 14px", borderRadius: 8 }}>
              View site
            </a>
            <form action="/api/auth/signout" method="POST" style={{ display: "inline" }}>
              <button type="submit" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.85)", border: "none", fontFamily: "Kodchasan, sans-serif", fontSize: "0.82rem", padding: "8px 14px", borderRadius: 8, cursor: "pointer" }}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 28 }} className="admin-kpis">
          {kpis.map(k => (
            <div key={k.label} style={{
              background: k.accent ? "linear-gradient(135deg,#DA6178,#CB3E5E)" : "#fff",
              border: "1px solid #EAEAEA", borderRadius: 14, padding: "16px 18px",
            }}>
              <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#161616", letterSpacing: "-0.02em", marginBottom: 4 }}>{k.value}</p>
              <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: k.accent ? "#FFFFFF" : "#8C8C8C", fontWeight: k.accent ? 600 : 400 }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Incoming new orders */}
        <AdminIncomingSection orders={newOrders as any} />

        {/* Tabs */}
        <AdminTabs activeTab={tab} newContacts={newContacts ?? 0} />

        {/* ── Orders Tab ── */}
        {tab === "orders" && (
          <div>
            <form method="GET" className="mb-5 flex gap-2">
              <input type="hidden" name="tab" value="orders" />
              <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search code, customer name, address…" className="flex-1 input-field" />
              <button type="submit" className="btn-primary px-5 py-2.5 text-sm">Search</button>
              {searchParams.q && <a href="/admin?tab=orders" className="btn-ghost px-5 py-2.5 text-sm">Clear</a>}
            </form>

            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#8C8C8C", marginBottom: 12 }}>
              Active Orders {q ? `— ${filteredActive.length} result(s)` : `(${activeOrders?.length ?? 0})`}
            </p>

            {filteredActive.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 16, padding: "48px", textAlign: "center", marginBottom: 32 }}>
                <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#A1A1AA" }}>
                  {q ? `No orders matching "${searchParams.q}"` : "No active orders right now."}
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: 32 }}>
                <AdminOrderTable orders={filteredActive as any} />
              </div>
            )}

            {(pastOrders?.length ?? 0) > 0 && !q && (
              <>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#A1A1AA", marginBottom: 12 }}>Past Orders</p>
                <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 16, overflow: "hidden" }}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead style={{ background: "#FAFAFA", borderBottom: "1px solid #F0F0F0" }}>
                        <tr>
                          {["Order", "Customer", "Service", "Date", "Status", "Update"].map(h => (
                            <th key={h} className="text-left px-4 py-3" style={{ color: "#A1A1AA", fontFamily: "Poppins, sans-serif", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pastOrders!.map((o: any) => (
                          <tr key={o.id} style={{ borderBottom: "1px solid #F4F4F5", opacity: 0.8 }}>
                            <td className="px-4 py-3 font-mono text-xs" style={{ color: "#A1A1AA" }}>{o.code}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: "#6B6B6B" }}>{o.customer_name ?? "—"}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: "#8C8C8C" }}>{o.service_title ?? o.service}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: "#8C8C8C" }}>{o.date}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                                {STATUS_LABELS[o.status] ?? o.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {!["delivered","cancelled"].includes(o.status)
                                ? <StatusUpdater orderCode={o.code} currentStatus={o.status} />
                                : <span style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#A1A1AA" }}>Final</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Contacts Tab ── */}
        {tab === "contacts" && (
          <div>
            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#8C8C8C", marginBottom: 16 }}>
              Contact Messages ({contacts?.length ?? 0})
            </p>
            {(contacts?.length ?? 0) === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 16, padding: "48px", textAlign: "center" }}>
                <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#A1A1AA" }}>No contact messages yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts!.map((c: any) => (
                  <div key={c.id} style={{ background: "#fff", border: `1.5px solid ${c.status === "new" ? "#CB3E5E" : "#EDEDED"}`, borderRadius: 16, padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                          {c.status === "new" && <span style={{ background: "#CB3E5E", color: "#FFFFFF", borderRadius: 999, padding: "2px 10px", fontSize: "0.72rem", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>New</span>}
                          {c.status === "replied" && <span style={{ background: "rgba(203,62,94,0.12)", color: "#431E2C", borderRadius: 999, padding: "2px 10px", fontSize: "0.72rem", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>Replied</span>}
                          {c.subject && <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#6B6B6B" }}>{c.subject}</span>}
                        </div>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#161616", marginBottom: 2 }}>{c.name}</p>
                        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#8C8C8C", marginBottom: 12 }}>
                          <a href={`mailto:${c.email}`} style={{ color: "#A82F4B" }}>{c.email}</a>
                          {c.phone && ` · ${c.phone}`}
                        </p>
                        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.9rem", color: "#6B6B6B", lineHeight: 1.7 }}>{c.message}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: "#A1A1AA" }}>{fmtDate(c.created_at)}</p>
                        <ContactUpdater contactId={c.id} currentStatus={c.status} email={c.email} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Analytics Tab ── */}
        {tab === "analytics" && (
          <div>
            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#8C8C8C", marginBottom: 16 }}>Business Overview</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Orders",     value: totalOrders ?? 0 },
                { label: "Active Orders",    value: activeCount ?? 0 },
                { label: "Orders Today",     value: todayOrders ?? 0 },
                { label: "Unread Messages",  value: newContacts ?? 0 },
                { label: "Total Customers",  value: totalCustomers ?? 0 },
              ].map(s => (
                <div key={s.label} style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 16, padding: "24px" }}>
                  <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.72rem", color: "#A1A1AA", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{s.label}</p>
                  <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "2.25rem", color: "#161616", letterSpacing: "-0.025em" }}>{s.value}</p>
                </div>
              ))}
            </div>
            {(activeOrders?.length ?? 0) > 0 && (
              <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 16, padding: "24px" }}>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.9rem", color: "#161616", marginBottom: 16 }}>Status Breakdown (Active)</p>
                <div className="space-y-2">
                  {Object.entries(
                    (activeOrders as any[]).reduce<Record<string, number>>((acc, o) => {
                      acc[o.status] = (acc[o.status] ?? 0) + 1;
                      return acc;
                    }, {})
                  ).map(([status, count]) => (
                    <div key={status} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold min-w-[110px] text-center ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[status] ?? status}
                      </span>
                      <div style={{ flex: 1, background: "#F4F4F5", borderRadius: 999, height: 8, overflow: "hidden" }}>
                        <div style={{ height: 8, background: "#CB3E5E", borderRadius: 999, width: `${Math.min(100, ((count as number) / (activeOrders!.length)) * 100)}%` }} />
                      </div>
                      <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#161616", minWidth: 24, textAlign: "right" }}>{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) { .admin-kpis { grid-template-columns: repeat(3,1fr) !important; } }
        @media (max-width: 560px) { .admin-kpis { grid-template-columns: repeat(2,1fr) !important; } .admin-th { display: none !important; } }
      `}</style>
    </div>
  );
}
