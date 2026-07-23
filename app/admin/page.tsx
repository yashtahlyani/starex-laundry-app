import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import StatusUpdater from "@/components/StatusUpdater";
import AdminTabs from "@/components/AdminTabs";
import ContactUpdater from "@/components/ContactUpdater";
import { AdminIncomingSection, AdminOrderTable } from "@/components/AdminOrdersClient";
import Logo from "@/components/Logo";
import AdminLivePoll from "@/components/AdminLivePoll";
import { getItemTracking } from "@/lib/itemTracking";
import { orderCodeColor } from "@/lib/orderCode";
import { Bell, AlertTriangle, X, Download } from "lucide-react";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  placed:              "bg-blue-50 text-blue-700",
  confirmed:           "bg-teal-50 text-teal-700",
  picked_up:           "bg-yellow-100 text-yellow-800",
  ready_for_delivery:  "bg-green-50 text-green-700",
  delivered:           "bg-gray-100 text-gray-500",
  cancelled:           "bg-red-50 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  placed:              "Placed",
  confirmed:           "Confirmed",
  picked_up:           "Picked Up",
  ready_for_delivery:  "Ready for Delivery",
  delivered:           "Delivered",
  cancelled:           "Cancelled",
};

const PAYMENT_BADGE: Record<string, string> = {
  paid:   "bg-green-50 text-green-700",
  unpaid: "bg-amber-100 text-amber-800",
};

const WASH_FAMILY = ["wash-fold", "express"];
const DRY_FAMILY  = ["dry-clean", "ironing", "household", "detailing"];

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-CA", {
    timeZone: "America/Toronto", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string; filter?: string; fam?: string };
}) {
  await requireAdmin();
  const db     = getSupabaseAdmin();
  const tab    = searchParams.tab ?? "orders";
  const q      = searchParams.q?.toLowerCase() ?? "";
  const filter = searchParams.filter ?? "";
  const fam    = searchParams.fam ?? "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const ACTIVE_STATUSES = ["placed", "confirmed", "picked_up", "ready_for_delivery"];
  const FINAL_STATUSES = ["delivered", "cancelled"];

  // activeOrders drives the header bell + the Incoming section, both of which
  // render above the tabs on every tab — so it's always needed. pastOrders
  // and the full contacts payload are only needed on their own tab: fetching
  // them regardless of which tab is open was the real cause of the console
  // feeling slow when switching to Messages (a 100-row contacts fetch with
  // full message text on every navigation, even Orders/Analytics).
  //
  // Both order queries use select("*") rather than an explicit column list —
  // deliberately, so newly-added columns (like payment_status/paid_at) show
  // up automatically without this file needing to track the DB schema.
  //
  // "Active" is defined as NOT final (.not(...in...)) rather than
  // .in(ACTIVE_STATUSES) — an order.status value outside the current known
  // set (a leftover from a prior pipeline, a bad import, anything) must
  // still show up *somewhere* rather than silently vanishing from both this
  // query and the "past" one below. This was a real bug found in review:
  // 8 of 24 live orders had legacy status values ("washing", "folding",
  // "out_for_delivery", "payment_pending" from before the pipeline was
  // simplified) and were invisible in both Active and Past Orders.
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
      .select("*")
      .not("status", "in", `(${FINAL_STATUSES.join(",")})`)
      .order("created_at", { ascending: false }),
    tab === "orders"
      ? db.from("orders")
          .select("*")
          .in("status", FINAL_STATUSES)
          .order("created_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: null }),
    tab === "contacts"
      ? db.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(100)
      : Promise.resolve({ data: null }),
    db.from("orders").select("*", { count: "exact", head: true }),
    db.from("orders").select("*", { count: "exact", head: true }).not("status", "in", `(${FINAL_STATUSES.join(",")})`),
    db.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("orders").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
  ]);

  const newOrders    = (activeOrders ?? []).filter((o: any) => o.status === "placed");
  // Family-scoped for the Incoming section only — the header bell/KPI counts
  // deliberately stay global (they're notifications, not tied to whichever
  // queue happens to be selected).
  const newOrdersInView = fam ? newOrders.filter((o: any) => (fam === "wash" ? WASH_FAMILY : DRY_FAMILY).includes(o.service)) : newOrders;
  const inProgressOrders = (activeOrders ?? []).filter((o: any) => o.status !== "placed");
  const todaysActiveOrders = (activeOrders ?? []).filter((o: any) => new Date(o.created_at) >= today);

  // KPI cards double as filters onto the Active Orders list below — click one
  // to see just that slice, click it again (or "Total orders") to clear it.
  const FILTERS: Record<string, any[]> = {
    new:         newOrders,
    in_progress: inProgressOrders,
    today:       todaysActiveOrders,
  };
  const filterBase = FILTERS[filter] ?? (activeOrders ?? []);

  const famBase = fam
    ? filterBase.filter((o: any) => (fam === "wash" ? WASH_FAMILY : DRY_FAMILY).includes(o.service))
    : filterBase;

  const filteredActive = q
    ? famBase.filter((o: any) =>
        o.code?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.email?.toLowerCase().includes(q) ||
        o.address?.toLowerCase().includes(q)
      )
    : famBase;

  const FILTER_LABELS: Record<string, string> = { new: "New orders", in_progress: "In progress", today: "Orders today" };

  const kpis = [
    { label: "New orders",   value: newOrders.length, accent: newOrders.length > 0, filterKey: "new", href: "/admin?tab=orders&filter=new" },
    { label: "In progress",  value: inProgressOrders.length, accent: false, filterKey: "in_progress", href: "/admin?tab=orders&filter=in_progress" },
    { label: "Orders today", value: todayOrders ?? 0, accent: false, filterKey: "today", href: "/admin?tab=orders&filter=today" },
    { label: "Total orders", value: totalOrders ?? 0, accent: false, filterKey: null, href: "/admin?tab=orders" },
    { label: "Customers",    value: totalCustomers ?? 0, accent: false, filterKey: null, href: null },
    { label: "Messages",     value: newContacts ?? 0, accent: false, filterKey: null, href: "/admin?tab=contacts" },
  ];

  return (
    <div style={{ background: "#F4F5F7", minHeight: "100vh" }}>

      {/* Admin header */}
      <header style={{ background: "#161616", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo color="#FFFFFF" fontSize="1.15rem" />
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)" }} />
            <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.7rem", color: "#C85770", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Owner console</p>
            <AdminLivePoll initialCount={newOrders.length} />
            {newOrders.length > 0 && (
              <span style={{ marginLeft: 8, display: "inline-flex", alignItems: "center", gap: 6, background: "#B8324F", color: "#FFFFFF", borderRadius: 999, padding: "4px 12px", fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.75rem" }}>
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

        {/* KPIs — click one to filter the Active Orders list to that slice */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 28 }} className="admin-kpis">
          {kpis.map(k => {
            const isActive = k.filterKey && filter === k.filterKey && tab === "orders";
            const card = (
              <div style={{
                background: k.accent ? "linear-gradient(135deg,#C85770,#B8324F)" : "#fff",
                border: isActive ? "1.5px solid #B8324F" : "1px solid #EAEAEA", borderRadius: 14, padding: "16px 18px",
                boxShadow: isActive ? "0 0 0 3px rgba(184,50,79,0.12)" : "none",
                transition: "box-shadow 0.15s, border-color 0.15s",
                cursor: k.href ? "pointer" : "default", height: "100%",
              }}>
                <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#161616", letterSpacing: "-0.02em", marginBottom: 4 }}>{k.value}</p>
                <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.75rem", color: k.accent ? "#FFFFFF" : "#8C8C8C", fontWeight: k.accent ? 600 : 400 }}>{k.label}</p>
              </div>
            );
            return k.href ? (
              <Link key={k.label} href={k.href} style={{ textDecoration: "none", display: "block" }} className="admin-kpi-link">{card}</Link>
            ) : (
              <div key={k.label}>{card}</div>
            );
          })}
        </div>

        {tab === "orders" && filter && FILTER_LABELS[filter] && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(184,50,79,0.1)", color: "#8F2740", borderRadius: 999, padding: "5px 12px", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.78rem" }}>
              Filtered: {FILTER_LABELS[filter]}
              <Link href={q ? `/admin?tab=orders&q=${encodeURIComponent(searchParams.q ?? "")}` : "/admin?tab=orders"} style={{ display: "inline-flex", color: "#8F2740" }}>
                <X size={13} />
              </Link>
            </span>
          </div>
        )}

        {/* Incoming new orders — respects the Wash & Fold / Dry Clean toggle
            so the two queues stay genuinely separate everywhere, not just in
            the table below. */}
        <AdminIncomingSection orders={newOrdersInView as any} />

        {/* Tabs */}
        <AdminTabs activeTab={tab} newContacts={newContacts ?? 0} />

        {/* ── Orders Tab ── */}
        {tab === "orders" && (
          <div>
            {/* One compact control row: Wash & Fold / Dry Clean bifurcation
                (the two order families use different STX/DTX codes, so the
                owner can work one queue at a time), search, and CSV export —
                previously two stacked rows with generous padding that ate a
                lot of vertical space for what it does. */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { key: "",     label: "All Orders" },
                  { key: "wash", label: "Wash & Fold" },
                  { key: "dry",  label: "Dry Clean" },
                ].map(f => {
                  const href = `/admin?tab=orders${filter ? `&filter=${filter}` : ""}${f.key ? `&fam=${f.key}` : ""}${searchParams.q ? `&q=${encodeURIComponent(searchParams.q)}` : ""}`;
                  const active = fam === f.key;
                  return (
                    <Link key={f.key} href={href} style={{
                      textDecoration: "none", padding: "7px 14px", borderRadius: 999,
                      fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.78rem", whiteSpace: "nowrap",
                      background: active ? "#161616" : "#fff", color: active ? "#fff" : "#6B6B6B",
                      border: active ? "1px solid #161616" : "1px solid #EAEAEA",
                    }}>
                      {f.label}
                    </Link>
                  );
                })}
              </div>

              <form method="GET" className="flex gap-2" style={{ flex: 1, minWidth: 220 }}>
                <input type="hidden" name="tab" value="orders" />
                {filter && <input type="hidden" name="filter" value={filter} />}
                {fam && <input type="hidden" name="fam" value={fam} />}
                <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Search code, customer, address…" className="flex-1 input-field" style={{ padding: "8px 14px", fontSize: "0.85rem" }} />
                <button type="submit" className="btn-primary px-4 py-2 text-sm">Search</button>
                {searchParams.q && (
                  <a href={`/admin?tab=orders${filter ? `&filter=${filter}` : ""}${fam ? `&fam=${fam}` : ""}`} className="btn-ghost px-4 py-2 text-sm">Clear</a>
                )}
              </form>

              <a
                href={`/api/admin/export${fam ? `?fam=${fam}` : ""}${searchParams.q ? `${fam ? "&" : "?"}q=${encodeURIComponent(searchParams.q)}` : ""}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
                  padding: "8px 16px", borderRadius: 10, border: "1px solid #EAEAEA", background: "#fff",
                  fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#161616", whiteSpace: "nowrap",
                }}
              >
                <Download size={13} /> Export CSV
              </a>
            </div>

            <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "#8C8C8C", marginBottom: 12 }}>
              Active Orders {(q || filter || fam) ? `— ${filteredActive.length} result(s)` : `(${activeOrders?.length ?? 0})`}
            </p>

            {filteredActive.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid #EAEAEA", borderRadius: 16, padding: "48px", textAlign: "center", marginBottom: 32 }}>
                <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#A1A1AA" }}>
                  {q
                    ? `No orders matching "${searchParams.q}"`
                    : filter
                      ? `No orders in "${FILTER_LABELS[filter]}" right now.`
                      : "No active orders right now."}
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: 32 }}>
                <AdminOrderTable orders={filteredActive as any} />
              </div>
            )}

            {(() => {
            const filteredPast = fam
              ? (pastOrders ?? []).filter((o: any) => (fam === "wash" ? WASH_FAMILY : DRY_FAMILY).includes(o.service))
              : (pastOrders ?? []);
            return (filteredPast.length ?? 0) > 0 && !q && (
              <>
                <p className="font-heading font-bold text-[0.85rem] text-[#A1A1AA] mb-3">Past Orders</p>
                <div className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                        <tr>
                          {["Order", "Customer", "Service", "Date", "Status", "Payment", "Update"].map(h => (
                            <th key={h} className="text-left px-4 py-3 font-heading font-semibold text-[0.7rem] tracking-wide uppercase text-[#A1A1AA]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPast.map((o: any) => {
                          const { missing } = getItemTracking(o.status_history);
                          return (
                          <tr key={o.id} className="border-b border-[#F4F4F5] opacity-80">
                            <td className="px-4 py-3 font-mono text-xs" style={{ color: orderCodeColor(o.code).text }}>
                              {o.code}
                              {missing ? (
                                <span title={`${missing} item${missing !== 1 ? "s" : ""} missing`} className="inline-flex items-center ml-1.5">
                                  <AlertTriangle size={11} color="#DC2626" />
                                </span>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-xs text-[#6B6B6B]">{o.customer_name ?? "—"}</td>
                            <td className="px-4 py-3 text-xs text-[#8C8C8C]">{o.service_title ?? o.service}</td>
                            <td className="px-4 py-3 text-xs text-[#8C8C8C]">{o.date}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                                {STATUS_LABELS[o.status] ?? o.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_BADGE[o.payment_status ?? "unpaid"]}`}>
                                {(o.payment_status ?? "unpaid") === "paid" ? "Paid" : "Unpaid"}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {!["delivered","cancelled"].includes(o.status)
                                ? <StatusUpdater orderCode={o.code} currentStatus={o.status} />
                                : <span className="font-body text-xs text-[#A1A1AA]">Final</span>
                              }
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
            })()}
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
                  <div key={c.id} style={{ background: "#fff", border: `1.5px solid ${c.status === "new" ? "#B8324F" : "#EDEDED"}`, borderRadius: 16, padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                          {c.status === "new" && <span style={{ background: "#B8324F", color: "#FFFFFF", borderRadius: 999, padding: "2px 10px", fontSize: "0.72rem", fontWeight: 700, fontFamily: "Poppins, sans-serif" }}>New</span>}
                          {c.status === "replied" && <span style={{ background: "rgba(184,50,79,0.12)", color: "#431E2C", borderRadius: 999, padding: "2px 10px", fontSize: "0.72rem", fontWeight: 600, fontFamily: "Poppins, sans-serif" }}>Replied</span>}
                          {c.subject && <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.8rem", color: "#6B6B6B" }}>{c.subject}</span>}
                        </div>
                        <p style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#161616", marginBottom: 2 }}>{c.name}</p>
                        <p style={{ fontFamily: "Kodchasan, sans-serif", fontSize: "0.8rem", color: "#8C8C8C", marginBottom: 12 }}>
                          <a href={`mailto:${c.email}`} style={{ color: "#8F2740" }}>{c.email}</a>
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
                        <div style={{ height: 8, background: "#B8324F", borderRadius: 999, width: `${Math.min(100, ((count as number) / (activeOrders!.length)) * 100)}%` }} />
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
