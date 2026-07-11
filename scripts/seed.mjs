// Seed demo data into Supabase for owner + customer demo
import { createClient } from "@supabase/supabase-js";

const URL = "https://fcamqiwabzowuwgfyjuo.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjYW1xaXdhYnpvd3V3Z2Z5anVvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzE2MTQyMiwiZXhwIjoyMDk4NzM3NDIyfQ.cquBhzicmUFtB0xegXd83bYPUJVNjzcnrjCrO_bcixE";

const db = createClient(URL, SERVICE_KEY);

function ago(days, hours = 10) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}
function future(days, hours = 10) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, 0, 0, 0);
  return d.toISOString();
}

// ── 1. Customers ──────────────────────────────────────────────────────────────
const rawCustomers = [
  { full_name: "Ava Johnson",    email: "ava@example.com",    phone: "+1-416-555-0101" },
  { full_name: "Marcus Lee",     email: "marcus@example.com", phone: "+1-416-555-0202" },
  { full_name: "Priya Sharma",   email: "priya@example.com",  phone: "+1-647-555-0303" },
  { full_name: "James Okafor",   email: "james@example.com",  phone: "+1-437-555-0404" },
];

console.log("Upserting customers…");
const { data: customers, error: cErr } = await db
  .from("customers")
  .upsert(rawCustomers, { onConflict: "email" })
  .select();
if (cErr) { console.error("customers:", cErr); process.exit(1); }
console.log(`  ${customers.length} customers OK`);

const byEmail = Object.fromEntries(customers.map(c => [c.email, c]));
const ava     = byEmail["ava@example.com"];
const marcus  = byEmail["marcus@example.com"];
const priya   = byEmail["priya@example.com"];
const james   = byEmail["james@example.com"];

// ── 2. Orders ─────────────────────────────────────────────────────────────────
// Delete existing demo orders first to avoid duplicates
const codes = [
  "LN-100001","LN-100002","LN-100003","LN-100004","LN-100005",
  "LN-200001","LN-200002","LN-200003",
  "LN-300001","LN-300002",
  "LN-400001",
];
await db.from("orders").delete().in("order_code", codes);

const rawOrders = [
  // AVA — 4 orders in various stages
  {
    order_code: "LN-100001", customer_id: ava.id,
    service_type: "wash-fold", pickup_address: "88 Queen St W, Toronto, ON", postal_code: "M5H 2M2",
    pickup_slot_start: ago(1, 9), pickup_slot_end: ago(1, 11),
    status: "in_progress", notes: "Separate darks from lights please",
    price_estimate_cents: 3200, created_at: ago(1, 9), updated_at: ago(0, 8),
  },
  {
    order_code: "LN-100002", customer_id: ava.id,
    service_type: "dry-clean", pickup_address: "88 Queen St W, Toronto, ON", postal_code: "M5H 2M2",
    pickup_slot_start: ago(7, 14), pickup_slot_end: ago(7, 16),
    status: "delivered", notes: "2 blazers, 1 wool coat",
    price_estimate_cents: 6499, created_at: ago(7, 14), updated_at: ago(4, 18),
  },
  {
    order_code: "LN-100003", customer_id: ava.id,
    service_type: "ironing", pickup_address: "88 Queen St W, Toronto, ON", postal_code: "M5H 2M2",
    pickup_slot_start: ago(14, 10), pickup_slot_end: ago(14, 12),
    status: "delivered", notes: "6 dress shirts, 2 trousers",
    price_estimate_cents: 2994, created_at: ago(14, 10), updated_at: ago(12, 16),
  },
  {
    order_code: "LN-100004", customer_id: ava.id,
    service_type: "wash-fold", pickup_address: "88 Queen St W, Toronto, ON", postal_code: "M5H 2M2",
    pickup_slot_start: future(2, 10), pickup_slot_end: future(2, 12),
    status: "scheduled", notes: null,
    price_estimate_cents: 2800, created_at: ago(0, 14), updated_at: ago(0, 14),
  },
  {
    order_code: "LN-100005", customer_id: ava.id,
    service_type: "wash-fold", pickup_address: "88 Queen St W, Toronto, ON", postal_code: "M5H 2M2",
    pickup_slot_start: ago(21, 10), pickup_slot_end: ago(21, 12),
    status: "delivered", notes: "Bedding + towels",
    price_estimate_cents: 4500, created_at: ago(21, 10), updated_at: ago(18, 16),
  },

  // MARCUS — active order being cleaned
  {
    order_code: "LN-200001", customer_id: marcus.id,
    service_type: "dry-clean", pickup_address: "340 Adelaide St W, Toronto, ON", postal_code: "M5V 1R7",
    pickup_slot_start: ago(2, 9), pickup_slot_end: ago(2, 11),
    status: "in_progress", notes: "3 suits for conference next week",
    price_estimate_cents: 14700, created_at: ago(2, 9), updated_at: ago(1, 12),
  },
  {
    order_code: "LN-200002", customer_id: marcus.id,
    service_type: "wash-fold", pickup_address: "340 Adelaide St W, Toronto, ON", postal_code: "M5V 1R7",
    pickup_slot_start: ago(10, 14), pickup_slot_end: ago(10, 16),
    status: "delivered", notes: null,
    price_estimate_cents: 1800, created_at: ago(10, 14), updated_at: ago(8, 18),
  },
  {
    order_code: "LN-200003", customer_id: marcus.id,
    service_type: "wash-fold", pickup_address: "340 Adelaide St W, Toronto, ON", postal_code: "M5V 1R7",
    pickup_slot_start: future(1, 9), pickup_slot_end: future(1, 11),
    status: "scheduled", notes: null,
    price_estimate_cents: 2400, created_at: ago(0, 10), updated_at: ago(0, 10),
  },

  // PRIYA — ready for pickup
  {
    order_code: "LN-300001", customer_id: priya.id,
    service_type: "ironing", pickup_address: "1 Blue Jays Way, Toronto, ON", postal_code: "M5V 1J1",
    pickup_slot_start: ago(3, 10), pickup_slot_end: ago(3, 12),
    status: "ready", notes: "10 shirts for work week",
    price_estimate_cents: 4990, created_at: ago(3, 10), updated_at: ago(1, 8),
  },
  {
    order_code: "LN-300002", customer_id: priya.id,
    service_type: "wash-fold", pickup_address: "1 Blue Jays Way, Toronto, ON", postal_code: "M5V 1J1",
    pickup_slot_start: future(3, 14), pickup_slot_end: future(3, 16),
    status: "scheduled", notes: null,
    price_estimate_cents: 3000, created_at: ago(0, 12), updated_at: ago(0, 12),
  },

  // JAMES — just picked up, out for delivery
  {
    order_code: "LN-400001", customer_id: james.id,
    service_type: "wash-fold", pickup_address: "255 Front St W, Toronto, ON", postal_code: "M5V 2W6",
    pickup_slot_start: ago(0, 9), pickup_slot_end: ago(0, 11),
    status: "out_for_delivery", notes: null,
    price_estimate_cents: 2250, created_at: ago(0, 9), updated_at: ago(0, 14),
  },
];

console.log("Inserting orders…");
const { data: orders, error: oErr } = await db.from("orders").insert(rawOrders).select();
if (oErr) { console.error("orders:", oErr); process.exit(1); }
console.log(`  ${orders.length} orders OK`);

// ── 3. Status events for Ava's in-progress order ─────────────────────────────
const avaActive = orders.find(o => o.order_code === "LN-100001");
if (avaActive) {
  await db.from("order_status_events").delete().eq("order_id", avaActive.id);
  await db.from("order_status_events").insert([
    { order_id: avaActive.id, status: "scheduled",  note: "Booking confirmed",     created_by: "system",          created_at: ago(1, 9) },
    { order_id: avaActive.id, status: "picked_up",  note: "Driver collected items", created_by: "system",         created_at: ago(1, 11) },
    { order_id: avaActive.id, status: "in_progress", note: "Cleaning in progress",  created_by: "owner@starex.ca", created_at: ago(0, 8) },
  ]);
  console.log("  Status events OK");
}

// ── 4. Issues ─────────────────────────────────────────────────────────────────
const avaDelivered = orders.find(o => o.order_code === "LN-100002");
await db.from("issues").delete().in("order_code", ["LN-100002", "LN-200002"]);
await db.from("issues").insert([
  {
    order_id: avaDelivered?.id ?? null, order_code: "LN-100002",
    customer_name: "Ava Johnson", customer_email: "ava@example.com",
    issue_type: "quality", description: "One of the blazers still has a small stain on the sleeve after dry cleaning.",
    priority: "normal", status: "in_review",
    created_at: ago(4, 10),
  },
  {
    order_id: null, order_code: "LN-200002",
    customer_name: "Marcus Lee", customer_email: "marcus@example.com",
    issue_type: "late_delivery", description: "Order was supposed to be delivered by 6pm but arrived at 8:30pm.",
    priority: "low", status: "resolved",
    resolution_note: "Apologised and issued a 15% discount on next order.",
    resolved_by: "owner@starex.ca",
    resolved_at: ago(7, 15), created_at: ago(8, 20),
  },
]);
console.log("  Issues OK");

// ── 5. Contact submissions ────────────────────────────────────────────────────
await db.from("contact_submissions").insert([
  {
    name: "Sarah Kim", email: "sarah.kim@gmail.com", phone: "+1-416-555-0505",
    subject: "Commercial Linen Inquiry",
    message: "Hi, I manage a boutique hotel with 30 rooms and we're looking for a reliable laundry partner. Can you send pricing for weekly commercial linen service?",
    status: "new", created_at: ago(0, 9),
  },
  {
    name: "Daniel Chen", email: "d.chen@outlook.com", phone: null,
    subject: "Express Same-Day Availability",
    message: "Do you cover the North York area for same-day service? I need suits cleaned urgently before a Friday event.",
    status: "new", created_at: ago(1, 16),
  },
  {
    name: "Amara Osei", email: "amara.osei@hotmail.com", phone: "+1-647-555-0606",
    subject: "Subscription Plan Question",
    message: "I'd like to switch from pay-as-you-go to the Standard plan. How do I do that and will my existing orders be affected?",
    status: "read", created_at: ago(3, 11),
  },
]);
console.log("  Contact submissions OK");

console.log("\n✓ Seed complete!");
console.log("  Customer login: ava@example.com / password");
console.log("  Owner login:    owner@starex.ca / starex2025");
console.log("\n  Ava's orders:");
console.log("    LN-100001 — in_progress (active, shows in dashboard hero card)");
console.log("    LN-100002 — delivered");
console.log("    LN-100003 — delivered");
console.log("    LN-100004 — scheduled (upcoming)");
console.log("    LN-100005 — delivered");
console.log("\n  Admin sees 11 total orders across 4 customers, 2 open/in-review issues, 3 contacts");
