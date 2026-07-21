-- Run once in Supabase → SQL Editor.
-- The app generates order codes randomly and checks for clashes before insert,
-- but the database itself should also guarantee uniqueness so a race between
-- two simultaneous bookings can never produce two orders with the same code
-- (order tracking looks orders up by code and expects exactly one row).
--
-- If this fails with "could not create unique index", there are already
-- duplicate codes in the table — find them with:
--   select code, count(*) from public.orders group by code having count(*) > 1;
-- fix those rows first, then re-run.

create unique index if not exists orders_code_key on public.orders (code);
