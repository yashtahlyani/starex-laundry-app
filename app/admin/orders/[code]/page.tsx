import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";
import { notFound } from "next/navigation";
import StatusUpdater from "@/components/StatusUpdater";

export const dynamic = "force-dynamic";

const SERVICE_LABELS: Record<string, string> = {
  "wash-fold": "Wash & Fold",
  express: "Same-Day Express",
  "dry-clean": "Dry Cleaning",
  ironing: "Ironing",
  household: "Household Items",
  detailing: "Car & Sofa Detailing",
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Scheduled",
  picked_up: "Picked Up",
  in_progress: "In Progress",
  ready: "Ready for Delivery",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function formatDt(d: string) {
  return new Date(d).toLocaleString("en-CA", {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { code: string };
}) {
  await requireAdmin();
  const supabaseAdmin = getSupabaseAdmin();
  const orderCode = params.code.toUpperCase();

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*, customers(full_name, email, phone)")
    .eq("order_code", orderCode)
    .single();

  if (!order) notFound();

  const [{ data: events }, { data: issues }] = await Promise.all([
    supabaseAdmin
      .from("order_status_events")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("issues")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false }),
  ]);

  const customer = (order as any).customers;

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-6">
          <a href="/admin?tab=orders" className="text-sm text-brand hover:underline">
            ← Back to Orders
          </a>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <p className="text-xs text-gray-400 mb-1">Order Detail</p>
            <h1 className="text-2xl font-bold font-mono text-gray-900">{orderCode}</h1>
            <p className="text-sm text-gray-400 mt-1">Created {formatDt(order.created_at)}</p>
          </div>
          <div className="shrink-0">
            <StatusUpdater orderCode={orderCode} currentStatus={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Customer */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Customer</p>
            <p className="text-base font-bold text-gray-900 mb-1">{customer?.full_name}</p>
            <a href={`mailto:${customer?.email}`} className="text-sm text-brand hover:underline block mb-1">
              {customer?.email}
            </a>
            {customer?.phone && (
              <a href={`tel:${customer.phone}`} className="text-sm text-gray-600 hover:underline block">
                {customer.phone}
              </a>
            )}
          </div>

          {/* Order Info */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Order Info</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-semibold text-gray-900">
                  {SERVICE_LABELS[order.service_type] ?? order.service_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-gray-900">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup</span>
                <span className="font-semibold text-gray-900 text-right max-w-[200px]">
                  {order.pickup_address}
                  {order.postal_code && `, ${order.postal_code}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pickup window</span>
                <span className="font-semibold text-gray-900">
                  {new Date(order.pickup_slot_start).toLocaleString("en-CA", {
                    timeZone: "America/Toronto",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              {order.notes && (
                <div className="mt-2 bg-yellow-50 rounded-xl px-3 py-2 text-xs text-yellow-800">
                  <span className="font-semibold">Note: </span>{order.notes}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status timeline */}
        {(events?.length ?? 0) > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Status History</p>
            <ul className="space-y-3">
              {events!.map((ev: any, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <div className="h-6 w-6 rounded-full bg-brand-50 flex items-center justify-center mt-0.5 shrink-0 text-brand text-xs font-bold">
                    {events!.length - i}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {STATUS_LABELS[ev.status] ?? ev.status}
                    </p>
                    {ev.note && <p className="text-xs text-gray-400">{ev.note}</p>}
                    <p className="text-xs text-gray-400">
                      {formatDt(ev.created_at)}
                      {ev.created_by && ` · ${ev.created_by}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Issues */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
            Issues ({issues?.length ?? 0})
          </p>
          {(issues?.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-400">No issues reported for this order.</p>
          ) : (
            <div className="space-y-4">
              {issues!.map((issue: any) => (
                <div key={issue.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 rounded-lg px-2 py-1">
                      {issue.issue_type.replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-xs rounded-lg px-2 py-1 font-semibold ${
                        issue.status === "open"
                          ? "bg-red-50 text-red-700"
                          : issue.status === "resolved"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {issue.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-400">Priority: {issue.priority}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                  <p className="text-xs text-gray-400">
                    {issue.customer_name} · {issue.customer_email} · {formatDt(issue.created_at)}
                  </p>
                  {issue.resolution_note && (
                    <div className="mt-2 bg-green-50 rounded-lg px-3 py-2 text-xs text-green-800">
                      <span className="font-semibold">Resolution: </span>{issue.resolution_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
