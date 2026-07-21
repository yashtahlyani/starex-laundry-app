-- ⚠️  READ FIRST: the customers / orders / order_status_events tables below are
-- the original Phase-1 design and do NOT match the live database — the app
-- actually runs against freshdrop/supabase/schema.sql (orders.code, profiles,
-- RLS policies). Do not run those sections. The issues and contact_submissions
-- sections at the bottom ARE the live definitions for those two tables.
--
-- Laundry booking platform — core schema (Phase 1)
-- Run this in the Supabase SQL editor for a new project.

create extension if not exists "pgcrypto";

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text not null,          -- used for WhatsApp notifications
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,           -- short human-readable ID shown to the customer, e.g. LN-482913
  customer_id uuid not null references customers(id),
  service_type text not null,                -- 'wash-fold' | 'dry-clean' | ... matches lib/pricing.ts ids
  pickup_address text not null,
  postal_code text not null,
  pickup_slot_start timestamptz not null,
  pickup_slot_end timestamptz not null,
  status text not null default 'scheduled',  -- scheduled | picked_up | in_progress | ready | out_for_delivery | delivered | cancelled
  estimated_weight_lb numeric,
  final_weight_lb numeric,
  price_estimate_cents integer,
  price_final_cents integer,
  stripe_payment_intent_id text,
  cleancloud_order_id text,                  -- populated once CleanCloud integration (Phase 2+) is live
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Every status change is logged here — this is what the notification pipeline
-- (email + WhatsApp) and the admin dashboard both read from.
create table order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  status text not null,
  note text,
  created_by text,             -- 'system' | staff email | 'cleancloud_webhook'
  created_at timestamptz not null default now()
);

create table notification_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  channel text not null,        -- 'email' | 'whatsapp'
  event_type text not null,     -- 'booking_confirmed' | 'ready' | 'delivered' | ...
  status text not null,         -- 'sent' | 'delivered' | 'failed'
  provider_message_id text,
  created_at timestamptz not null default now()
);

-- ---------- Phase 2: smart lockers (create when locker pilot starts) ----------

create table locker_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null
);

create table locker_compartments (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locker_locations(id),
  label text not null,                        -- e.g. "A3"
  status text not null default 'free',        -- free | reserved | occupied | awaiting_pickup | out_of_service
  current_order_id uuid references orders(id)
);

create table locker_codes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  compartment_id uuid not null references locker_compartments(id),
  code_type text not null,          -- 'dropoff' | 'pickup'
  code_hash text not null,          -- never store plaintext codes
  expires_at timestamptz not null,
  attempt_count integer not null default 0,
  used_at timestamptz
);

create table locker_events (
  id uuid primary key default gen_random_uuid(),
  compartment_id uuid not null references locker_compartments(id),
  order_id uuid references orders(id),
  event_type text not null,     -- 'opened' | 'closed' | 'failed_attempt' | 'staff_override'
  actor text,                   -- 'customer_code' | staff id | 'system'
  created_at timestamptz not null default now()
);

-- Basic indexes for the lookups the app will do most often
create index on orders (customer_id);
create index on orders (order_code);
create index on order_status_events (order_id);
create index on locker_compartments (location_id);

-- ─── Issues / Complaints ──────────────────────────────────────────────────────
create table if not exists issues (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id),
  order_code text,
  customer_name text not null,
  customer_email text not null,
  issue_type text not null,   -- 'lost_item' | 'damage' | 'late_delivery' | 'billing' | 'quality' | 'other'
  description text not null,
  priority text not null default 'normal',  -- 'low' | 'normal' | 'high' | 'urgent'
  status text not null default 'open',      -- 'open' | 'in_review' | 'resolved' | 'closed'
  resolution_note text,
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists issues_order_id_idx on issues (order_id);
create index if not exists issues_status_idx on issues (status);
create index if not exists issues_created_at_idx on issues (created_at desc);

-- ─── Contact Form Submissions ─────────────────────────────────────────────────
create table if not exists contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new',  -- 'new' | 'read' | 'replied'
  admin_note text,
  created_at timestamptz not null default now()
);

create index if not exists contact_status_idx on contact_submissions (status);
create index if not exists contact_created_at_idx on contact_submissions (created_at desc);
