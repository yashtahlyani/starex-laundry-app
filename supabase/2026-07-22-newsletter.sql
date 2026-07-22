-- Run once in Supabase → SQL Editor.
-- Backs the footer newsletter signup, which previously showed a confirmation
-- but discarded the email. Anyone can subscribe; only the owner can read the
-- list (the app writes via the service-role key, which bypasses RLS).

create table if not exists public.newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists newsletter_insert on public.newsletter_subscribers;
create policy newsletter_insert on public.newsletter_subscribers for insert with check (true);

drop policy if exists newsletter_select_owner on public.newsletter_subscribers;
create policy newsletter_select_owner on public.newsletter_subscribers for select using (public.is_owner());
