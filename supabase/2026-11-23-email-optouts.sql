-- Run once in Supabase -> SQL Editor.
--
-- The suppression list for marketing email. Canada's anti-spam law (CASL)
-- requires every commercial message to carry a working unsubscribe, and
-- requires it to be honoured; this table is what "honoured" means in
-- practice. The owner asked for it himself: "we can put choose to
-- unsubscribe button to avoid any litigations. Here the laws are very strict
-- about any marketing/unwanted calls/message/emails."
--
-- Deliberately separate from `profiles` and from `orders`. An opt-out has to
-- outlive the account and the order it came from: someone who unsubscribes
-- and later places another order has still unsubscribed, and deleting their
-- old order must not quietly re-subscribe them.
--
-- This list suppresses MARKETING only. Order confirmations, "your laundry is
-- ready" and payment receipts are transactional messages that the customer
-- asked for by placing an order, and are not covered.
create table if not exists public.email_optouts (
  email      text primary key,
  reason     text,
  source     text,                                   -- which campaign they left from
  created_at timestamptz not null default now()
);

-- Stored lowercased by the application; the index makes a case-mistake
-- impossible to miss rather than relying on that.
create unique index if not exists email_optouts_lower_idx
  on public.email_optouts (lower(email));

-- Written only through the service role in API routes, never from the
-- browser, so RLS stays on with no policies: that denies the anon key by
-- default, which is what we want for a list of people's email addresses.
alter table public.email_optouts enable row level security;
