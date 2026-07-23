-- Run once in Supabase -> SQL Editor.
--
-- Reduces admin manual effort: the order status pipeline drops "In Process"
-- and "Payment Pending" as separate stages the owner has to click through
-- (they added clicks without a distinct physical checkpoint). Payment is now
-- tracked on its own column (payment_status), shown as a badge in the admin
-- order row, and set automatically the moment a card charge succeeds or the
-- owner taps "Mark Paid" — no separate status click needed. The order's
-- fulfillment status auto-advances to "delivered" the moment payment clears
-- on an order that's already Ready for Delivery.
--
-- New pipeline: placed -> confirmed -> picked_up -> ready_for_delivery -> delivered

alter table public.orders
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists paid_at         timestamptz;

-- Backfill: collapse any orders currently sitting in the removed stages so
-- they remain valid under the new, shorter status list. "in_process" folds
-- back into "picked_up" (work is still in progress); "payment_pending"
-- forward into "ready_for_delivery" with payment left unpaid — the owner
-- confirms via "Mark Paid" or a card charge once they've actually collected it.
update public.orders set status = 'picked_up'          where status = 'in_process';
update public.orders set status = 'ready_for_delivery'  where status = 'payment_pending';
