-- notification_log was referenced by lib/notifications.ts from the start
-- (email/WhatsApp send audit trail) but the table itself was never created —
-- every insert has been silently swallowed by its own best-effort try/catch,
-- so there has been no way to see whether a given order's notifications
-- actually sent, were skipped (no API key configured), or failed.
create table if not exists notification_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  channel text not null,        -- 'email' | 'whatsapp'
  event_type text not null,     -- 'booking_confirmed' | 'confirmed' | 'picked_up' | 'ready_for_delivery' | 'delivered' | 'custom_note'
  status text not null,         -- 'sent' | 'failed' | 'skipped'
  provider_message_id text,
  created_at timestamptz not null default now()
);

create index if not exists notification_log_order_id_idx on notification_log(order_id);
