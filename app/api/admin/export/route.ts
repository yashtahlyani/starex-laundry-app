import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const WASH_FAMILY = ["wash-fold", "express"];
const DRY_FAMILY  = ["dry-clean", "ironing", "household", "detailing"];

// Excel/Sheets choke on unescaped commas, quotes, and newlines inside a
// field — wrap in quotes and double up any embedded quotes per the CSV spec
// whenever any of those appear.
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const HEADERS = [
  "Order Code", "Status", "Payment Status", "Customer Name", "Email", "Phone",
  "Service", "Price (CAD)", "Weight", "Pickup Date", "Time Slot", "Address",
  "Notes", "Created At", "Updated At",
];

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fam = searchParams.get("fam") ?? "";
  const q   = (searchParams.get("q") ?? "").toLowerCase();

  const db = getSupabaseAdmin();
  const { data: orders, error } = await db
    .from("orders")
    .select("code, status, payment_status, customer_name, email, phone, service, service_title, price, weight, date, time_slot, address, notes, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let rows = orders ?? [];
  if (fam) {
    const family = fam === "wash" ? WASH_FAMILY : DRY_FAMILY;
    rows = rows.filter((o: any) => family.includes(o.service));
  }
  if (q) {
    rows = rows.filter((o: any) =>
      o.code?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.address?.toLowerCase().includes(q)
    );
  }

  const lines = [
    HEADERS.join(","),
    ...rows.map((o: any) => [
      o.code, o.status, o.payment_status ?? "unpaid", o.customer_name, o.email, o.phone,
      o.service_title ?? o.service, o.price ?? "", o.weight ?? "", o.date, o.time_slot, o.address,
      o.notes ?? "", o.created_at, o.updated_at,
    ].map(csvCell).join(",")),
  ];

  // Leading BOM so Excel (which guesses encoding from the first bytes, not
  // just the header) opens accented/special characters correctly instead of
  // mangling them — a common gotcha with plain UTF-8 CSVs in Excel specifically.
  const csv = "﻿" + lines.join("\r\n");
  const filename = `starex-orders-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
