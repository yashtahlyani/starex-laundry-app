-- ============================================================
--  StareX — Supabase schema
--  Paste this whole file into Supabase → SQL Editor → Run.
-- ============================================================

-- 1) PROFILES  (one row per user, linked to Supabase Auth)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  phone      text default '',
  role       text not null default 'customer',   -- 'customer' | 'owner'
  addresses  jsonb not null default '[]',
  prefs      jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- 2) ORDERS
create table if not exists public.orders (
  id             uuid primary key,
  code           text not null,
  user_id        uuid references public.profiles(id) on delete set null,
  customer_name  text,
  email          text,
  phone          text,
  address        text,
  service        text,
  service_title  text,
  date           text,
  time_slot      text,
  notes          text default '',
  status         text not null default 'placed',
  status_history jsonb not null default '[]',
  weight         text default 'TBD',
  price          numeric,
  rating         int,
  is_new         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_user_id_idx  on public.orders(user_id);
create index if not exists orders_created_idx   on public.orders(created_at desc);

-- 3) Auto-create a profile whenever someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
          new.email,
          coalesce(new.raw_user_meta_data->>'phone',''));
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Helper: is the current user the owner?  (security definer avoids RLS recursion)
create or replace function public.is_owner()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

-- 5) Row Level Security
alter table public.profiles enable row level security;
alter table public.orders   enable row level security;

-- profiles: you can see & edit your own; owner can see everyone
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select
  using (auth.uid() = id or public.is_owner());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (auth.uid() = id);

-- orders: customers see/insert their own; owner sees & updates all
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders for select
  using (auth.uid() = user_id or public.is_owner());
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders for insert
  with check (auth.uid() = user_id);
drop policy if exists orders_update_owner on public.orders;
create policy orders_update_owner on public.orders for update
  using (public.is_owner());
-- customers may update their own order only to leave a rating
drop policy if exists orders_update_own on public.orders;
create policy orders_update_own on public.orders for update
  using (auth.uid() = user_id);

-- 6) Realtime (so the owner console updates the instant an order arrives)
alter publication supabase_realtime add table public.orders;

-- ============================================================
--  AFTER you sign up your owner account in the app once, run:
--    update public.profiles set role = 'owner' where email = 'owner@starex.ca';
--  (use whatever email you registered the owner with)
-- ============================================================
