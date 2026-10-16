import { calculateHst, PER_LB_SERVICES } from "@/lib/pricing";
import { getItemTracking } from "@/lib/itemTracking";
import { orderCodeColor } from "@/lib/orderCode";
import { MapPin, Phone, Mail, Repeat } from "lucide-react";

/**
 * Customer records — every order a person has placed, with the details needed
 * to serve them without asking.
 *
 * Added 2026-10-14, from the client: "today I got the repeated order from one
 * of our customers and I was unable to see his address, what rates was charged
 * last time and even his contact details. It is not good to ask your regular
 * repeated customer, your address please?"
 *
 * The console genuinely couldn't answer that. Past orders were capped at 20,
 * carried no address or amount, and — worse — the whole Past Orders table was
 * hidden the moment you typed in the search box, so looking someone up made
 * their history disappear.
 *
 * Rendered server-side with <details> for expand/collapse, so it needs no
 * client JS and the owner's phone doesn't wait on a bundle mid-call.
 */

type Order = {
  id: string; code: string; status: string; service: string; service_title?: string | null;
  customer_name?: string | null; email?: string | null; phone?: string | null; address?: string | null;
  date: string; time_slot?: string | null; price?: number | null; weight?: string | null;
  payment_status?: string | null; paid_at?: string | null; notes?: string | null;
  created_at: string; status_history?: any[];
};

export type Customer = {
  key: string;
  name: string;
  email: string;
  phone: string;
  addresses: string[];
  orders: Order[];
  completed: number;
  totalBilledCad: number;
  lastOrderAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed", picked_up: "Picked Up", confirmed: "Confirmed",
  ready_for_delivery: "Ready", delivered: "Delivered", cancelled: "Cancelled",
};

const digits = (s?: string | null) => (s ?? "").replace(/\D/g, "");

/**
 * Group orders into people. Keyed on email where there is one, falling back to
 * the phone number — a guest who books twice with the same email is the same
 * customer even though guest bookings create no profile row, which is why
 * grouping on user_id would have missed exactly the repeat customers this is
 * for.
 */
export function groupCustomers(orders: Order[]): Customer[] {
  const map = new Map<string, Customer>();

  for (const o of orders) {
    const email = (o.email ?? "").trim().toLowerCase();
    const phone = digits(o.phone);
    const key = email || (phone ? `tel:${phone}` : `order:${o.id}`);

    let c = map.get(key);
    if (!c) {
      c = {
        key, name: "", email, phone: o.phone?.trim() ?? "",
        addresses: [], orders: [], completed: 0, totalBilledCad: 0, lastOrderAt: o.created_at,
      };
      map.set(key, c);
    }
    c.orders.push(o);

    // Orders arrive newest-first, so the first non-empty value wins and the
    // customer shows their most recent name, number and address — the ones
    // worth reading back to them.
    if (!c.name && o.customer_name?.trim()) c.name = o.customer_name.trim();
    if (!c.phone && o.phone?.trim()) c.phone = o.phone.trim();
    const addr = o.address?.trim();
    if (addr && !c.addresses.includes(addr)) c.addresses.push(addr);

    if (o.status === "delivered") c.completed++;
    // Billed, not merely invoiced: only what was actually charged counts, so
    // the lifetime figure can't be inflated by unpaid or cancelled orders.
    if (o.price != null && o.payment_status === "paid") {
      c.totalBilledCad += calculateHst(Number(o.price)).total;
    }
    if (o.created_at > c.lastOrderAt) c.lastOrderAt = o.created_at;
  }

  return [...map.values()].sort((a, b) => (a.lastOrderAt < b.lastOrderAt ? 1 : -1));
}

export function filterCustomers(customers: Customer[], q: string): Customer[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return customers;
  const nDigits = needle.replace(/\D/g, "");
  return customers.filter(c =>
    c.name.toLowerCase().includes(needle) ||
    c.email.toLowerCase().includes(needle) ||
    (nDigits.length >= 4 && digits(c.phone).includes(nDigits)) ||
    c.addresses.some(a => a.toLowerCase().includes(needle)) ||
    c.orders.some(o => o.code?.toLowerCase().includes(needle))
  );
}

const money = (n: number) => `$${n.toFixed(2)}`;
const fmtDay = (d: string) =>
  new Date(d).toLocaleDateString("en-CA", { timeZone: "America/Toronto", year: "numeric", month: "short", day: "numeric" });

function Detail({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.82rem] text-[#4A4A4A] font-body">
      <Icon size={13} className="shrink-0 text-[#A1A1AA]" />
      {children}
    </span>
  );
}

export default function AdminCustomers({ customers, query }: { customers: Customer[]; query: string }) {
  if (customers.length === 0) {
    return (
      <div className="bg-white border border-[#EAEAEA] rounded-2xl p-12 text-center">
        <p className="font-body text-[#A1A1AA]">
          {query ? `No customer matching "${query}".` : "No customers yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {customers.map(c => {
        const repeat = c.orders.length > 1;
        return (
          <details key={c.key} className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden" open={customers.length === 1}>
            <summary className="cursor-pointer list-none px-5 py-4 hover:bg-[#FAFAFA]">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-heading font-bold text-[0.98rem] text-[#161616]">{c.name || "(no name on file)"}</p>
                    {repeat && (
                      <span className="inline-flex items-center gap-1 bg-[#FDF0F1] text-[#B30F14] rounded-full px-2 py-0.5 text-[0.68rem] font-heading font-bold">
                        <Repeat size={10} /> {c.orders.length} orders
                      </span>
                    )}
                  </div>
                  {/* Everything needed to greet a returning customer without
                      asking them anything, visible before expanding. */}
                  <div className="flex items-center gap-x-4 gap-y-1 flex-wrap mt-1.5">
                    {c.phone && <Detail icon={Phone}><a href={`tel:${digits(c.phone)}`} className="hover:underline">{c.phone}</a></Detail>}
                    {c.email && <Detail icon={Mail}><a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a></Detail>}
                  </div>
                  {c.addresses[0] && (
                    <div className="mt-1">
                      <Detail icon={MapPin}>
                        {c.addresses[0]}
                        {c.addresses.length > 1 && (
                          <span className="text-[#A1A1AA]"> · +{c.addresses.length - 1} other</span>
                        )}
                      </Detail>
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-heading font-bold text-[1.05rem] text-[#161616]">{money(c.totalBilledCad)}</p>
                  <p className="font-body text-[0.7rem] text-[#A1A1AA]">billed to date</p>
                  <p className="font-body text-[0.7rem] text-[#A1A1AA] mt-1">last: {fmtDay(c.lastOrderAt)}</p>
                </div>
              </div>
            </summary>

            <div className="border-t border-[#F0F0F0] px-5 py-4">
              {c.addresses.length > 1 && (
                <div className="mb-4">
                  <p className="font-heading font-semibold text-[0.7rem] uppercase tracking-wide text-[#A1A1AA] mb-1">All addresses used</p>
                  <ul className="list-none flex flex-col gap-0.5">
                    {c.addresses.map((a, i) => (
                      <li key={a} className="font-body text-[0.82rem] text-[#4A4A4A]">
                        {i === 0 ? <strong>{a}</strong> : a}{i === 0 && <span className="text-[#A1A1AA]"> (most recent)</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="font-heading font-semibold text-[0.7rem] uppercase tracking-wide text-[#A1A1AA] mb-2">
                Order history — what was charged
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#FAFAFA] border-y border-[#F0F0F0]">
                    <tr>
                      {["Order", "Date", "Service", "Quantity", "Subtotal", "HST", "Total", "Status"].map(h => (
                        <th key={h} className="text-left px-3 py-2 font-heading font-semibold text-[0.68rem] tracking-wide uppercase text-[#A1A1AA] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {c.orders.map(o => {
                      const priced = o.price != null;
                      const { subtotal, hst, total } = priced ? calculateHst(Number(o.price)) : { subtotal: 0, hst: 0, total: 0 };
                      const { received, returned } = getItemTracking(o.status_history);
                      // Wash services are weighed, dry cleaning is counted —
                      // "45 in" means pounds on one and garments on the other.
                      const unit = PER_LB_SERVICES.includes(o.service) ? "lb" : "items";
                      const qty = [
                        o.weight && o.weight !== "TBD" ? o.weight : null,
                        received != null ? `${received} ${unit} in` : null,
                        returned != null ? `${returned} ${unit} out` : null,
                      ].filter(Boolean).join(" · ");
                      return (
                        <tr key={o.id} className="border-b border-[#F4F4F5] align-top">
                          <td className="px-3 py-2 font-mono text-[0.72rem] whitespace-nowrap" style={{ color: orderCodeColor(o.code).text }}>{o.code}</td>
                          <td className="px-3 py-2 text-[0.75rem] text-[#8C8C8C] whitespace-nowrap">{fmtDay(o.date)}</td>
                          <td className="px-3 py-2 text-[0.75rem] text-[#4A4A4A]">{o.service_title ?? o.service}</td>
                          <td className="px-3 py-2 text-[0.75rem] text-[#8C8C8C] whitespace-nowrap">{qty || "—"}</td>
                          <td className="px-3 py-2 text-[0.75rem] text-[#4A4A4A] whitespace-nowrap">{priced ? money(subtotal) : "—"}</td>
                          <td className="px-3 py-2 text-[0.75rem] text-[#8C8C8C] whitespace-nowrap">{priced ? money(hst) : "—"}</td>
                          <td className="px-3 py-2 text-[0.8rem] font-heading font-bold text-[#161616] whitespace-nowrap">
                            {priced ? money(total) : <span className="font-body font-normal text-[#A1A1AA]">not priced</span>}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="font-body text-[0.72rem] text-[#6B6B6B]">{STATUS_LABELS[o.status] ?? o.status}</span>
                            <span className={`ml-1.5 inline-block px-1.5 py-0.5 rounded-full text-[0.65rem] font-semibold ${
                              (o.payment_status ?? "unpaid") === "paid" ? "bg-green-50 text-green-700" : "bg-amber-100 text-amber-800"
                            }`}>
                              {(o.payment_status ?? "unpaid") === "paid" ? "Paid" : "Unpaid"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Notes carry the per-item detail staff recorded at pickup and
                  the estimate the customer was shown — which is where a
                  special rate agreed with a regular would have been written
                  down. */}
              {c.orders.some(o => o.notes) && (
                <div className="mt-4">
                  <p className="font-heading font-semibold text-[0.7rem] uppercase tracking-wide text-[#A1A1AA] mb-1">Notes on past orders</p>
                  <ul className="list-none flex flex-col gap-1.5">
                    {c.orders.filter(o => o.notes).map(o => (
                      <li key={o.id} className="font-body text-[0.78rem] text-[#4A4A4A] leading-relaxed">
                        <span className="font-mono text-[0.7rem]" style={{ color: orderCodeColor(o.code).text }}>{o.code}</span>{" "}
                        <span className="text-[#A1A1AA]">({fmtDay(o.date)})</span> — {o.notes}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
