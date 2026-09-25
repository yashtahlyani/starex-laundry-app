import type { StatusEvent } from "./repositories/order.repository";

export type ItemTracking = {
  received: number | null;
  returned: number | null;
  missing: number | null;
  // What was actually in the bag, typed out by staff ("3 shirts, 2 trousers,
  // 1 bedsheet") — a count alone doesn't say which garment went missing.
  receivedDetails: string | null;
  returnedDetails: string | null;
};

// Item counts live inside status_history rather than their own columns — the
// "picked_up" event's itemCount is what staff counted at pickup, the
// "delivered" event's itemCount is what actually made it back. No schema
// change needed since status_history is already a flexible jsonb column.
export function getItemTracking(statusHistory: StatusEvent[] | null | undefined): ItemTracking {
  const history = statusHistory ?? [];
  const pickup   = history.find((e) => e.status === "picked_up");
  const delivery = history.find((e) => e.status === "delivered");
  const received = pickup?.itemCount ?? null;
  const returned = delivery?.itemCount ?? null;
  const missing = received != null && returned != null ? received - returned : null;
  return {
    received,
    returned,
    missing,
    receivedDetails: pickup?.itemDetails?.trim() || null,
    returnedDetails: delivery?.itemDetails?.trim() || null,
  };
}
