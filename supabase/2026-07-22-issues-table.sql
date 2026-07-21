-- Run once in Supabase → SQL Editor.
-- The app has an issues/complaints feature (customer "Report an issue" form on
-- the order tracking page, and an Issues tab in the admin console) but the
-- table was never created in the live database. This adds it, matching what
-- app/api/issues expects.

create table if not exists public.issues (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references public.orders(id),
  order_code      text,
  customer_name   text not null,
  customer_email  text not null,
  issue_type      text not null,   -- lost_item | damage | late_delivery | billing | quality | other
  description     text not null,
  priority        text not null default 'normal',  -- low | normal | high | urgent
  status          text not null default 'open',     -- open | in_review | resolved | closed
  resolution_note text,
  resolved_by     text,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists issues_order_id_idx   on public.issues (order_id);
create index if not exists issues_status_idx      on public.issues (status);
create index if not exists issues_created_at_idx   on public.issues (created_at desc);

-- Anyone can file an issue; only the owner can read/update them. The app writes
-- via the service-role key (bypasses RLS), so these policies just lock down
-- direct anon/customer access — same posture as contact_submissions.
alter table public.issues enable row level security;

drop policy if exists issues_insert on public.issues;
create policy issues_insert on public.issues for insert with check (true);

drop policy if exists issues_select_owner on public.issues;
create policy issues_select_owner on public.issues for select using (public.is_owner());

drop policy if exists issues_update_owner on public.issues;
create policy issues_update_owner on public.issues for update using (public.is_owner());
