// Seed demo data into the freshdrop Supabase DB (profiles + orders schema)
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

const URL  = "https://fcamqiwabzowuwgfyjuo.supabase.co";
const SKEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYW1xaXdhYnpvd3V3Z2Z5anVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE2MTQyMiwiZXhwIjoyMDk4NzM3NDIyfQ.cquBhzicmUFtB0xegXd83bYPUJVNjzcnrjCrO_bcixE";

const db = createClient(URL, SKEY, { auth: { autoRefreshToken: false, persistSession: false } });

function daysAgo(n, h = 10) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}
function daysFrom(n, h = 10) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
}
function dateStr(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" });
}

// ── helpers ────────────────────────────────────────────────────────────────────
async function ensureAuthUser(email, password, name, phone) {
  // list existing users to find by email
  const { data: list } = await db.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users?.find(u => u.email === email);
  if (existing) {
    console.log(`  auth user exists: ${email} (${existing.id})`);
    return existing.id;
  }
  const { data, error } = await db.auth.admin.createUser({
    email, password,
    email_confirm: true,
    user_metadata: { name, phone },
  });
  if (error) { console.error(`  create user ${email}:`, error.message); process.exit(1); }
  console.log(`  created auth user: ${email} (${data.user.id})`);
  return data.user.id;
}

async function upsertProfile(id, name, email, phone, role = "customer") {
  const { error } = await db.from("profiles").upsert(
    { id, name, email, phone, role },
    { onConflict: "id" }
  );
  if (error) console.warn(`  profile upsert ${email}:`, error.message);
}

// ── 1. Auth users ──────────────────────────────────────────────────────────────
console.log("\n── Auth users ──");
const avaId    = await ensureAuthUser("ava@example.com",    "password",   "Ava Johnson",  "+1-416-555-0101");
const marcusId = await ensureAuthUser("marcus@example.com", "password",   "Marcus Lee",   "+1-416-555-0202");
const priyaId  = await ensureAuthUser("priya@example.com",  "password",   "Priya Sharma", "+1-647-555-0303");
const jamesId  = await ensureAuthUser("james@example.com",  "password",   "James Okafor", "+1-437-555-0404");

// ── 2. Profiles ────────────────────────────────────────────────────────────────
console.log("\n── Profiles ──");
await upsertProfile(avaId,    "Ava Johnson",  "ava@example.com",    "+1-416-555-0101");
await upsertProfile(marcusId, "Marcus Lee",   "marcus@example.com", "+1-416-555-0202");
await upsertProfile(priyaId,  "Priya Sharma", "priya@example.com",  "+1-647-555-0303");
await upsertProfile(jamesId,  "James Okafor", "james@example.com",  "+1-437-555-0404");
console.log("  4 profiles OK");

// ── 3. Clear old seed orders ───────────────────────────────────────────────────
const seedCodes = [
  "STX-1001","STX-1002","STX-1003","STX-1004","STX-1005",
  "STX-2001","STX-2002","STX-2003",
  "STX-3001","STX-3002",
  "STX-4001",
];
await db.from("orders").delete().in("code", seedCodes);

// ── 4. Orders ──────────────────────────────────────────────────────────────────
console.log("\n── Orders ──");

const orders = [
  // AVA — active order (washing stage) — shows in dashboard hero card
  {
    id: randomUUID(), code: "STX-1001", user_id: avaId,
    customer_name: "Ava Johnson", email: "ava@example.com", phone: "+1-416-555-0101",
    address: "88 Queen St W, Toronto, ON M5H 2M2",
    service: "wash-fold", service_title: "Wash & Fold",
    date: dateStr(-1), time_slot: "9:00 AM – 11:00 AM",
    notes: "Separate darks from lights please",
    status: "washing",
    status_history: [
      { status: "placed",    label: "Order Placed",    time: daysAgo(1, 9),  note: "Booking confirmed" },
      { status: "confirmed", label: "Confirmed",       time: daysAgo(1, 10), note: "Driver assigned" },
      { status: "picked_up", label: "Picked Up",       time: daysAgo(1, 11), note: "Items collected from your door" },
      { status: "washing",   label: "Being Washed",    time: daysAgo(0, 8),  note: "Your laundry is being cleaned" },
    ],
    weight: "4.2 kg", price: 32, is_new: false,
    created_at: daysAgo(1, 9), updated_at: daysAgo(0, 8),
  },
  // AVA — delivered (dry-clean)
  {
    id: randomUUID(), code: "STX-1002", user_id: avaId,
    customer_name: "Ava Johnson", email: "ava@example.com", phone: "+1-416-555-0101",
    address: "88 Queen St W, Toronto, ON M5H 2M2",
    service: "dry-clean", service_title: "Dry Cleaning",
    date: dateStr(-7), time_slot: "2:00 PM – 4:00 PM",
    notes: "2 blazers, 1 wool coat",
    status: "delivered",
    status_history: [
      { status: "placed",           label: "Order Placed",    time: daysAgo(7, 14) },
      { status: "confirmed",        label: "Confirmed",       time: daysAgo(7, 15) },
      { status: "picked_up",        label: "Picked Up",       time: daysAgo(7, 16) },
      { status: "washing",          label: "Dry Cleaning",    time: daysAgo(6, 9) },
      { status: "folding",          label: "Pressed",         time: daysAgo(5, 14) },
      { status: "out_for_delivery", label: "Out for Delivery",time: daysAgo(4, 9) },
      { status: "delivered",        label: "Delivered",       time: daysAgo(4, 18) },
    ],
    weight: "3.1 kg", price: 64.99, rating: 5, is_new: false,
    created_at: daysAgo(7, 14), updated_at: daysAgo(4, 18),
  },
  // AVA — delivered (ironing)
  {
    id: randomUUID(), code: "STX-1003", user_id: avaId,
    customer_name: "Ava Johnson", email: "ava@example.com", phone: "+1-416-555-0101",
    address: "88 Queen St W, Toronto, ON M5H 2M2",
    service: "ironing", service_title: "Ironing & Pressing",
    date: dateStr(-14), time_slot: "10:00 AM – 12:00 PM",
    notes: "6 dress shirts, 2 trousers",
    status: "delivered",
    status_history: [
      { status: "placed",           label: "Order Placed",    time: daysAgo(14, 10) },
      { status: "confirmed",        label: "Confirmed",       time: daysAgo(14, 11) },
      { status: "picked_up",        label: "Picked Up",       time: daysAgo(14, 12) },
      { status: "folding",          label: "Ironing",         time: daysAgo(13, 9) },
      { status: "out_for_delivery", label: "Out for Delivery",time: daysAgo(12, 8) },
      { status: "delivered",        label: "Delivered",       time: daysAgo(12, 16) },
    ],
    weight: "2.8 kg", price: 29.94, rating: 4, is_new: false,
    created_at: daysAgo(14, 10), updated_at: daysAgo(12, 16),
  },
  // AVA — upcoming scheduled
  {
    id: randomUUID(), code: "STX-1004", user_id: avaId,
    customer_name: "Ava Johnson", email: "ava@example.com", phone: "+1-416-555-0101",
    address: "88 Queen St W, Toronto, ON M5H 2M2",
    service: "wash-fold", service_title: "Wash & Fold",
    date: dateStr(2), time_slot: "10:00 AM – 12:00 PM",
    notes: null,
    status: "placed",
    status_history: [
      { status: "placed", label: "Order Placed", time: daysAgo(0, 14), note: "Scheduled for pickup" },
    ],
    weight: "TBD", price: 28, is_new: true,
    created_at: daysAgo(0, 14), updated_at: daysAgo(0, 14),
  },
  // AVA — old delivered (bedding)
  {
    id: randomUUID(), code: "STX-1005", user_id: avaId,
    customer_name: "Ava Johnson", email: "ava@example.com", phone: "+1-416-555-0101",
    address: "88 Queen St W, Toronto, ON M5H 2M2",
    service: "wash-fold", service_title: "Wash & Fold",
    date: dateStr(-21), time_slot: "10:00 AM – 12:00 PM",
    notes: "Bedding and towels",
    status: "delivered",
    status_history: [
      { status: "placed",           label: "Order Placed",    time: daysAgo(21, 10) },
      { status: "confirmed",        label: "Confirmed",       time: daysAgo(21, 11) },
      { status: "picked_up",        label: "Picked Up",       time: daysAgo(21, 12) },
      { status: "washing",          label: "Being Washed",    time: daysAgo(20, 9) },
      { status: "folding",          label: "Folding",         time: daysAgo(19, 14) },
      { status: "out_for_delivery", label: "Out for Delivery",time: daysAgo(18, 9) },
      { status: "delivered",        label: "Delivered",       time: daysAgo(18, 16) },
    ],
    weight: "6.5 kg", price: 45, rating: 5, is_new: false,
    created_at: daysAgo(21, 10), updated_at: daysAgo(18, 16),
  },

  // MARCUS — dry-clean in progress (3 suits)
  {
    id: randomUUID(), code: "STX-2001", user_id: marcusId,
    customer_name: "Marcus Lee", email: "marcus@example.com", phone: "+1-416-555-0202",
    address: "340 Adelaide St W, Toronto, ON M5V 1R7",
    service: "dry-clean", service_title: "Dry Cleaning",
    date: dateStr(-2), time_slot: "9:00 AM – 11:00 AM",
    notes: "3 suits for conference next week",
    status: "folding",
    status_history: [
      { status: "placed",    label: "Order Placed", time: daysAgo(2, 9) },
      { status: "confirmed", label: "Confirmed",    time: daysAgo(2, 10) },
      { status: "picked_up", label: "Picked Up",    time: daysAgo(2, 11) },
      { status: "washing",   label: "Dry Cleaning", time: daysAgo(1, 9) },
      { status: "folding",   label: "Pressing",     time: daysAgo(0, 12) },
    ],
    weight: "5.8 kg", price: 147, is_new: false,
    created_at: daysAgo(2, 9), updated_at: daysAgo(0, 12),
  },
  // MARCUS — delivered
  {
    id: randomUUID(), code: "STX-2002", user_id: marcusId,
    customer_name: "Marcus Lee", email: "marcus@example.com", phone: "+1-416-555-0202",
    address: "340 Adelaide St W, Toronto, ON M5V 1R7",
    service: "wash-fold", service_title: "Wash & Fold",
    date: dateStr(-10), time_slot: "2:00 PM – 4:00 PM",
    notes: null,
    status: "delivered",
    status_history: [
      { status: "placed",           label: "Order Placed",    time: daysAgo(10, 14) },
      { status: "confirmed",        label: "Confirmed",       time: daysAgo(10, 15) },
      { status: "picked_up",        label: "Picked Up",       time: daysAgo(10, 16) },
      { status: "washing",          label: "Being Washed",    time: daysAgo(9, 9) },
      { status: "folding",          label: "Folding",         time: daysAgo(9, 14) },
      { status: "out_for_delivery", label: "Out for Delivery",time: daysAgo(8, 9) },
      { status: "delivered",        label: "Delivered",       time: daysAgo(8, 18) },
    ],
    weight: "3.0 kg", price: 18, rating: 4, is_new: false,
    created_at: daysAgo(10, 14), updated_at: daysAgo(8, 18),
  },
  // MARCUS — upcoming
  {
    id: randomUUID(), code: "STX-2003", user_id: marcusId,
    customer_name: "Marcus Lee", email: "marcus@example.com", phone: "+1-416-555-0202",
    address: "340 Adelaide St W, Toronto, ON M5V 1R7",
    service: "wash-fold", service_title: "Wash & Fold",
    date: dateStr(1), time_slot: "9:00 AM – 11:00 AM",
    notes: null,
    status: "placed",
    status_history: [
      { status: "placed", label: "Order Placed", time: daysAgo(0, 10) },
    ],
    weight: "TBD", price: 24, is_new: true,
    created_at: daysAgo(0, 10), updated_at: daysAgo(0, 10),
  },

  // PRIYA — out for delivery
  {
    id: randomUUID(), code: "STX-3001", user_id: priyaId,
    customer_name: "Priya Sharma", email: "priya@example.com", phone: "+1-647-555-0303",
    address: "1 Blue Jays Way, Toronto, ON M5V 1J1",
    service: "ironing", service_title: "Ironing & Pressing",
    date: dateStr(-3), time_slot: "10:00 AM – 12:00 PM",
    notes: "10 shirts for work week",
    status: "out_for_delivery",
    status_history: [
      { status: "placed",           label: "Order Placed",    time: daysAgo(3, 10) },
      { status: "confirmed",        label: "Confirmed",       time: daysAgo(3, 11) },
      { status: "picked_up",        label: "Picked Up",       time: daysAgo(3, 12) },
      { status: "folding",          label: "Ironing",         time: daysAgo(2, 9) },
      { status: "out_for_delivery", label: "Out for Delivery",time: daysAgo(0, 9) },
    ],
    weight: "2.2 kg", price: 49.90, is_new: false,
    created_at: daysAgo(3, 10), updated_at: daysAgo(0, 9),
  },
  // PRIYA — future booking
  {
    id: randomUUID(), code: "STX-3002", user_id: priyaId,
    customer_name: "Priya Sharma", email: "priya@example.com", phone: "+1-647-555-0303",
    address: "1 Blue Jays Way, Toronto, ON M5V 1J1",
    service: "wash-fold", service_title: "Wash & Fold",
    date: dateStr(3), time_slot: "2:00 PM – 4:00 PM",
    notes: null,
    status: "placed",
    status_history: [
      { status: "placed", label: "Order Placed", time: daysAgo(0, 12) },
    ],
    weight: "TBD", price: 30, is_new: true,
    created_at: daysAgo(0, 12), updated_at: daysAgo(0, 12),
  },

  // JAMES — confirmed today, driver heading over
  {
    id: randomUUID(), code: "STX-4001", user_id: jamesId,
    customer_name: "James Okafor", email: "james@example.com", phone: "+1-437-555-0404",
    address: "255 Front St W, Toronto, ON M5V 2W6",
    service: "wash-fold", service_title: "Wash & Fold",
    date: dateStr(0), time_slot: "9:00 AM – 11:00 AM",
    notes: null,
    status: "confirmed",
    status_history: [
      { status: "placed",    label: "Order Placed", time: daysAgo(0, 7) },
      { status: "confirmed", label: "Confirmed",    time: daysAgo(0, 8), note: "Driver assigned, heading your way" },
    ],
    weight: "TBD", price: 22.50, is_new: true,
    created_at: daysAgo(0, 7), updated_at: daysAgo(0, 8),
  },
];

const { data: inserted, error: oErr } = await db.from("orders").insert(orders).select("code, status");
if (oErr) { console.error("orders insert:", oErr); process.exit(1); }
console.log(`  ${inserted.length} orders inserted:`);
inserted.forEach(o => console.log(`    ${o.code} — ${o.status}`));

console.log(`
✓ Seed complete!

  CUSTOMER LOGINS (all password: "password"):
    ava@example.com    — 5 orders (1 active washing, 1 upcoming, 3 delivered)
    marcus@example.com — 3 orders (1 in pressing, 1 upcoming, 1 delivered)
    priya@example.com  — 2 orders (1 out-for-delivery, 1 upcoming)
    james@example.com  — 1 order  (confirmed today)

  OWNER LOGIN:
    owner@starex.ca / starex2025
    → Admin sees 11 orders total across 4 customers
    → 3 active (STX-1001 washing, STX-2001 pressing, STX-3001 out_for_delivery)
    → 3 new/incoming (STX-1004, STX-2003, STX-3002, STX-4001)
`);
