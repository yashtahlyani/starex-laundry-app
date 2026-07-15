import type { StatusEvent } from "./repositories/order.repository";

export type ItemTracking = {
  received: number | null;
  returned: number | null;
  missing: number | null;
};

// Item counts live inside status_history rather than their own columns — the
// "picked_up" event's itemCount is what staff counted at pickup, the
// "delivered" event's itemCount is what actually made it back. No schema
// change needed since status_history is already a flexible jsonb column.
export function getItemTracking(statusHistory: StatusEvent[] | null | undefined): ItemTracking {
  const history = statusHistory ?? [];
  const received = history.find((e) => e.status === "picked_up")?.itemCount ?? null;
  const returned = history.find((e) => e.status === "delivered")?.itemCount ?? null;
  const missing = received != null && returned != null ? received - returned : null;
  return { received, returned, missing };
}
