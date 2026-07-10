import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import StatusUpdater from "@/components/StatusUpdater";
import AdminTabs from "@/components/AdminTabs";
import IssueUpdater from "@/components/IssueUpdater";
import ContactUpdater from "@/components/ContactUpdater";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  "wash-fold": "Wash & Fold",
  "dry-clean": "Dry Cleaning",
  ironing: "Ironing",
  alteration: "Alteration",
};

const STATUS_COLORS: Record<string, string> = {
  scheduled:        "bg-mint/10 text-mint",
  picked_up:        "bg-yellow-400/10 text-yellow-400",
  in_progress:      "bg-orange-400/10 text-orange-400",
  ready:            "bg-mint/10 text-mint",
  out_for_delivery: "bg-mint/15 text-mint",
  delivered:        "bg-white/5 text-white/35",
  cancelled:        "bg-red-400/10 text-red-400",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled:        "Scheduled",
  picked_up:        "Picked Up",
  in_progress:      "In Progress",
  ready:            "Ready",
  out_for_delivery: "Out for Delivery",
  delivered:        "Delivered",
  cancelled:        "Cancelled",
};

const ISSUE_PRIORITY_COLORS: Record<string, string> = {
  low:    "bg-white/5 text-white/45",
  normal: "bg-mint/10 text-mint",
  high:   "bg-orange-400/10 text-orange-400",
  urgent: "bg-red-400/10 text-red-400",
};

const ISSUE_STATUS_COLORS: Record<string, string> = {
  open:      "bg-red-400/10 text-red-400",
  in_review: "bg-yellow-400/10 text-yellow-400",
  resolved:  "bg-mint/10 text-mint",
  closed:    "bg-white/5 text-white/35",
};

function formatSlot(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return `${new Date(start).toLocaleString("en-CA", opts)} – ${new Date(end).toLocaleTimeString("en-CA", {
    timeZone: "America/Toronto",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })}`;
}

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string; q?: string };
}) {
  const user = await requireAdmin();
  const supabaseAdmin = getSupabaseAdmin();
  const tab = searchParams.tab ?? "orders";
  const searchQuery = searchParams.q?.toLowerCase() ?? "";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { data: upcoming },
    { data: past },
    { data: allIssues },
    { data: contacts },
    { count: totalOrders },
    { count: activeOrders },
    { count: openIssues },
    { count: newContacts },
  ] = await Promise.all([
    supabaseAdmin
      .from("orders")
      .select(
        "id, order_code, service_type, status, pickup_address, postal_code, pickup_slot_start, pickup_slot_end, notes, customers(full_name, email, phone)"
      )
      .gte("pickup_slot_start", today.toISOString())
      .order("pickup_slot_start", { ascending: true }),
    supabaseAdmin
      .from("orders")
      .select(
        "id, order_code, service_type, status, pickup_address, pickup_slot_start, pickup_slot_end, customers(full_name, email, phone)"
      )
      .lt("pickup_slot_start", today.toISOString())
      .order("pickup_slot_start", { ascending: false })
      .limit(30),
    supabaseAdmin.from("issues").select("*").order("created_at", { ascending: false }).limit(100),
    supabaseAdmin.from("contact_submissions").select("*").order("created_at", { ascending: false }).limit(100),
    supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["scheduled", "picked_up", "in_progress", "ready", "out_for_delivery"]),
    supabaseAdmin.from("issues").select("*", { count: "exact", head: true }).in("status", ["open", "in_review"]),
    supabaseAdmin.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const filteredUpcoming = searchQuery
    ? (upcoming ?? []).filter(
        (o: any) =>
          o.order_code.toLowerCase().includes(searchQuery) ||
          o.customers?.full_name?.toLowerCase().includes(searchQuery) ||
          o.customers?.email?.toLowerCase().includes(searchQuery) ||
          o.pickup_address?.toLowerCase().includes(searchQuery)
      )
    : (upcoming ?? []);

  const stats = [
    { label: "Total Orders",     value: totalOrders ?? 0,  color: "text-mint" },
    { label: "Active Now",       value: activeOrders ?? 0, color: "text-orange-400" },
    { label: "Open Issues",      value: openIssues ?? 0,   color: "text-red-400" },
    { label: "Unread Messages",  value: newContacts ?? 0,  color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-[#111921] pt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs text-white/30 mb-0.5 font-body">Staff Dashboard · {user.email}</p>
            <h1 className="text-2xl font-bold text-white font-heading">Starex Operations</h1>
          </div>
          <p className="text-sm text-white/30 hidden sm:block font-body">
            {new Date().toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="card-dark rounded-2xl border border-white/8 p-4 text-center">
              <p className={`text-3xl font-bold font-heading ${s.color}`}>{s.value}</p>
              <p className="text-xs text-white/30 mt-1 font-body">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <AdminTabs activeTab={tab} openIssues={openIssues ?? 0} newContacts={newContacts ?? 0} />

        {/* ── Orders Tab ── */}
        {tab === "orders" && (
          <div>
            <form method="GET" className="mb-5 flex gap-2">
              <input type="hidden" name="tab" value="orders" />
              <input
                name="q"
                defaultValue={searchParams.q ?? ""}
                placeholder="Search order code, customer name, address…"
                className="flex-1 input-field"
              />
              <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
                Search
              </button>
              {searchParams.q && (
                <a href="/admin?tab=orders" className="btn-ghost px-5 py-2.5 text-sm">
                  Clear
                </a>
              )}
            </form>

            <h2 className="text-sm font-bold text-white/55 mb-3 font-body">
              Upcoming &amp; Active{" "}
              {searchQuery ? `— ${filteredUpcoming.length} result(s)` : `(${upcoming?.length ?? 0})`}
            </h2>

            {filteredUpcoming.length === 0 ? (
              <div className="card-dark rounded-2xl border border-white/8 p-12 text-center text-white/30 mb-8 font-body">
                {searchQuery ? `No orders matching "${searchParams.q}"` : "No upcoming orders."}
              </div>
            ) : (
              <div className="card-dark rounded-2xl border border-white/8 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/8">
                      <tr>
                        {["Order", "Customer", "Service", "Pickup Window", "Address", "Status", ""].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider whitespace-nowrap font-body">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUpcoming.map((o: any) => (
                        <tr key={o.id} className="hover:bg-white/3 transition-colors">
                          <td className="px-4 py-4">
                            <span className="font-mono font-bold text-mint text-xs">{o.order_code}</span>
                          </td>
                          <td className="px-4 py-4">
                            <p className="font-medium text-white text-sm font-heading">{o.customers?.full_name}</p>
                            <p className="text-xs text-white/35 font-body">{o.customers?.phone}</p>
                            <p className="text-xs text-white/35 font-body">{o.customers?.email}</p>
                          </td>
                          <td className="px-4 py-4 text-white/55 whitespace-nowrap text-sm font-body">
                            {SERVICE_LABELS[o.service_type] ?? o.service_type}
                          </td>
                          <td className="px-4 py-4 text-xs text-white/35 whitespace-nowrap font-body">
                            {formatSlot(o.pickup_slot_start, o.pickup_slot_end)}
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-xs text-white/50 max-w-[180px] font-body">{o.pickup_address}</p>
                            {o.notes && (
                              <p className="text-xs text-white/30 italic mt-0.5 font-body">&ldquo;{o.notes}&rdquo;</p>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <StatusUpdater orderCode={o.order_code} currentStatus={o.status} />
                          </td>
                          <td className="px-4 py-4">
                            <a href={`/admin/orders/${o.order_code}`} className="text-xs text-mint hover:underline whitespace-nowrap font-body">
                              View →
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {(past?.length ?? 0) > 0 && !searchQuery && (
              <>
                <h2 className="text-sm font-bold text-white/30 mb-3 font-body">Recent Past Orders</h2>
                <div className="card-dark rounded-2xl border border-white/8 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-white/5 border-b border-white/8">
                        <tr>
                          {["Order", "Customer", "Service", "Pickup", "Status", ""].map((h) => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-wider font-body">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {past!.map((o: any) => (
                          <tr key={o.id} className="hover:bg-white/3 opacity-70">
                            <td className="px-4 py-3 font-mono text-xs text-white/35">{o.order_code}</td>
                            <td className="px-4 py-3 text-xs text-white/50 font-body">{o.customers?.full_name}</td>
                            <td className="px-4 py-3 text-xs text-white/35 font-body">
                              {SERVICE_LABELS[o.service_type] ?? o.service_type}
                            </td>
                            <td className="px-4 py-3 text-xs text-white/30 font-body">
                              {formatSlot(o.pickup_slot_start, o.pickup_slot_end)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`badge text-xs ${STATUS_COLORS[o.status] ?? "bg-white/5 text-white/35"}`}>
                                {STATUS_LABELS[o.status] ?? o.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <a href={`/admin/orders/${o.order_code}`} className="text-xs text-mint hover:underline font-body">
                                View
                              </a>
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

        {/* ── Issues Tab ── */}
        {tab === "issues" && (
          <div>
            <h2 className="text-sm font-bold text-white/55 mb-4 font-body">All Issues ({allIssues?.length ?? 0})</h2>
            {(allIssues?.length ?? 0) === 0 ? (
              <div className="card-dark rounded-2xl border border-white/8 p-12 text-center text-white/30 font-body">
                No issues reported yet.
              </div>
            ) : (
              <div className="space-y-3">
                {allIssues!.map((issue: any) => (
                  <div key={issue.id} className="card-dark rounded-2xl border border-white/8 p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {issue.order_code && (
                            <a href={`/admin/orders/${issue.order_code}`} className="font-mono font-bold text-mint text-xs hover:underline">
                              {issue.order_code}
                            </a>
                          )}
                          <span className={`badge text-xs ${ISSUE_PRIORITY_COLORS[issue.priority]}`}>
                            {issue.priority}
                          </span>
                          <span className={`badge text-xs ${ISSUE_STATUS_COLORS[issue.status]}`}>
                            {issue.status.replace("_", " ")}
                          </span>
                          <span className="text-xs text-white/35 bg-white/5 px-2 py-1 rounded-lg font-body">
                            {issue.issue_type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-sm text-white font-semibold mb-1 font-heading">{issue.customer_name}</p>
                        <p className="text-xs text-white/35 mb-2 font-body">{issue.customer_email}</p>
                        <p className="text-sm text-white/55 leading-relaxed font-body">{issue.description}</p>
                        {issue.resolution_note && (
                          <div className="mt-3 bg-mint/8 border border-mint/20 rounded-xl px-4 py-3">
                            <p className="text-xs font-semibold text-mint mb-1 font-body">Resolution Note</p>
                            <p className="text-sm text-mint/80 font-body">{issue.resolution_note}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-xs text-white/30 font-body">{formatDate(issue.created_at)}</p>
                        <IssueUpdater issueId={issue.id} currentStatus={issue.status} currentPriority={issue.priority} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Contacts Tab ── */}
        {tab === "contacts" && (
          <div>
            <h2 className="text-sm font-bold text-white/55 mb-4 font-body">
              Contact Messages ({contacts?.length ?? 0})
            </h2>
            {(contacts?.length ?? 0) === 0 ? (
              <div className="card-dark rounded-2xl border border-white/8 p-12 text-center text-white/30 font-body">
                No contact messages yet.
              </div>
            ) : (
              <div className="space-y-3">
                {contacts!.map((c: any) => (
                  <div key={c.id} className={`card-dark rounded-2xl border p-5 ${c.status === "new" ? "border-mint/30" : "border-white/8"}`}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {c.status === "new"     && <span className="badge bg-mint text-[#0a1a0f] text-xs">New</span>}
                          {c.status === "read"    && <span className="badge bg-white/8 text-white/45 text-xs">Read</span>}
                          {c.status === "replied" && <span className="badge bg-mint/10 text-mint text-xs">Replied</span>}
                          <span className="text-xs font-semibold text-white/70 font-body">{c.subject}</span>
                        </div>
                        <p className="text-sm font-semibold text-white mb-0.5 font-heading">{c.name}</p>
                        <p className="text-xs text-white/35 mb-3 font-body">
                          <a href={`mailto:${c.email}`} className="text-mint hover:underline">{c.email}</a>
                          {c.phone && ` · ${c.phone}`}
                        </p>
                        <p className="text-sm text-white/50 leading-relaxed font-body">{c.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <p className="text-xs text-white/30 font-body">{formatDate(c.created_at)}</p>
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
            <h2 className="text-sm font-bold text-white/55 mb-4 font-body">Business Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Orders (All Time)", value: totalOrders ?? 0,  color: "text-mint" },
                { label: "Active Orders",           value: activeOrders ?? 0, color: "text-orange-400" },
                { label: "Open Issues",             value: openIssues ?? 0,   color: "text-red-400" },
                { label: "Unread Messages",         value: newContacts ?? 0,  color: "text-purple-400" },
                { label: "Upcoming Pickups",        value: upcoming?.length ?? 0, color: "text-white/70" },
              ].map((s) => (
                <div key={s.label} className="card-dark rounded-2xl border border-white/8 p-6">
                  <p className="text-xs text-white/30 mb-1 uppercase tracking-wider font-semibold font-body">{s.label}</p>
                  <p className={`text-4xl font-bold font-heading ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="card-dark rounded-2xl border border-white/8 p-6">
              <p className="text-sm font-bold text-white/70 mb-4 font-heading">Upcoming Order Status Breakdown</p>
              {upcoming && upcoming.length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(
                    (upcoming as any[]).reduce<Record<string, number>>((acc, o) => {
                      acc[o.status] = (acc[o.status] ?? 0) + 1;
                      return acc;
                    }, {})
                  ).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-3">
                      <span className={`badge text-xs ${STATUS_COLORS[status] ?? "bg-white/5 text-white/35"}`}>
                        {STATUS_LABELS[status] ?? status}
                      </span>
                      <div className="flex-1 bg-white/8 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-mint rounded-full"
                          style={{ width: `${Math.min(100, ((count as number) / (upcoming.length)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-white/55 w-6 text-right font-heading">{count as number}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm font-body">No upcoming orders to analyze.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
