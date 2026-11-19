-- Two owner-controlled gates on booking, requested 2026-11-19:
--
--   1. "I want some customers to be black listed ... who are not good pay
--      masters" - stop a specific person booking again.
--   2. "A function for holiday mode ... for when we want anyone can't book
--      any order in specific window/date" - close a date, or one pickup
--      window on a date.
--
-- Both live in Postgres rather than Redis on purpose. The Redis helpers in
-- lib/redis/client.ts no-op on failure by design, so a Redis outage would
-- silently let a blocked customer book and let orders land on a closed
-- holiday - failing open is exactly what these must not do.

-- ── Blocked customers ───────────────────────────────────────────────────────
-- Matched on email OR phone, because the same person books with whichever
-- they feel like typing. Phone is stored as its last ten digits so that
-- "(416) 555-1234", "416-555-1234" and "+1 416 555 1234" are one person.
create table if not exists blocked_customers (
  id          uuid primary key default gen_random_uuid(),
  email       text,
  phone_last10 text,
  name        text,                                  -- for the admin list only
  reason      text,                                  -- why, so it is not a mystery later
  blocked_by  text,                                  -- which staff account did it
  created_at  timestamptz not null default now(),
  -- A row that identifies nobody would block nobody, or everybody.
  constraint blocked_customers_identifies_someone
    check (email is not null or phone_last10 is not null)
);

-- Case-insensitive, so Someone@Example.com cannot slip past someone@example.com.
create unique index if not exists blocked_customers_email_idx
  on blocked_customers (lower(email)) where email is not null;
create unique index if not exists blocked_customers_phone_idx
  on blocked_customers (phone_last10) where phone_last10 is not null;

-- ── Holiday mode: closed dates and windows ──────────────────────────────────
-- time_slot null means the whole day is closed. A row with a time_slot closes
-- just that window, so a half day off does not cost the whole day's bookings.
create table if not exists blocked_dates (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  time_slot  text,
  reason     text,                                   -- shown to nobody; for the owner's memory
  created_by text,
  created_at timestamptz not null default now()
);

-- One row per date+window. The empty string stands in for "whole day" because
-- NULL is not equal to NULL, so a plain unique index would allow duplicates.
create unique index if not exists blocked_dates_unique_idx
  on blocked_dates (date, coalesce(time_slot, ''));
create index if not exists blocked_dates_date_idx on blocked_dates (date);

-- Both tables are read and written only through the service role in API
-- routes, never from the browser, so row level security stays on with no
-- policies: that denies the anon key by default, which is what we want.
alter table blocked_customers enable row level security;
alter table blocked_dates     enable row level security;
