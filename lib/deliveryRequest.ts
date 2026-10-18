import type { StatusEvent } from "./repositories/order.repository";

// The window a customer asked for when they paid ("Sunday, October 18 ·
// Between 10 & noon please"). It is recorded as a status_history note rather
// than its own column, so this is the one place that knows how to read it
// back — the CSV export had its own private copy of this logic, and the admin
// console had none at all, which is why the owner was messaging customers to
// ask for a time they had already given (reported 2026-10-18).
const MARKER = "delivery requested:";

export function getDeliveryRequest(statusHistory: StatusEvent[] | null | undefined): string | null {
  // Reversed: if a customer somehow pays twice or staff re-record it, the
  // most recent request is the one that stands.
  const match = [...(statusHistory ?? [])]
    .reverse()
    .find(e => typeof e?.note === "string" && e.note.includes(MARKER));
  if (!match?.note) return null;
  const value = match.note.split(MARKER)[1]?.trim();
  return value ? value : null;
}
