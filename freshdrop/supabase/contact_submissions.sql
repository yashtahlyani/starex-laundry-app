-- Run this once in your Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Creates the contact submissions table with proper RLS.

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null,
  status      text not null default 'new',   -- new | read | resolved
  created_at  timestamptz not null default now()
);

-- Anyone can submit (anon OK); only the owner can read
alter table public.contact_submissions enable row level security;

drop policy if exists contact_insert on public.contact_submissions;
create policy contact_insert on public.contact_submissions for insert
  with check (true);

drop policy if exists contact_select_owner on public.contact_submissions;
create policy contact_select_owner on public.contact_submissions for select
  using (public.is_owner());

drop policy if exists contact_update_owner on public.contact_submissions;
create policy contact_update_owner on public.contact_submissions for update
  using (public.is_owner());
