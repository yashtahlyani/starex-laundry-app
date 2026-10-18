import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";
import { getItemTracking } from "@/lib/itemTracking";
import { getDeliveryRequest } from "@/lib/deliveryRequest";
import { calculateHst, PER_LB_SERVICES } from "@/lib/pricing";

export const dynamic = "force-dynamic";

// The wash/dry split comes from lib/pricing.ts so it can't drift —
// PER_LB_SERVICES is the same list this file used to keep privately.
const WASH_FAMILY = PER_LB_SERVICES;
const DRY_FAMILY  = ["dry-clean", "ironing", "household", "detailing"];

// Excel/Sheets choke on unescaped commas, quotes, and newlines inside a
// field — wrap in quotes and double up any embedded quotes per the CSV spec
// whenever any of those appear.
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Amounts are split out rather than left as one "Price" column: orders.price
// is always the pre-tax subtotal, so a manifest showing only that understates
// every order by 13% against what was actually charged (per client,
// 2026-09-25). Item counts and any delivery time the customer asked for at
// payment are here too, so the printed manifest is the whole story.
const HEADERS = [
  "Order Code", "Status", "Payment Status", "Customer Name", "Email", "Phone",
  "Service", "Subtotal (CAD)", "HST (CAD)", "Total incl. HST (CAD)", "Paid At",
  // Renamed from "Items ..." because on Wash & Fold / Express / Wash & Press
  // these are pounds, not garments — the Qty Unit column says which.
  "Weight", "Qty Received", "Qty Returned", "Qty Difference", "Qty Unit", "Item Details",
  "Delivery Requested", "Pickup Date", "Time Slot", "Address",
  "Notes", "Created At", "Updated At",
];

// Reads the customer's requested delivery window out of status_history. The
// logic lives in lib/deliveryRequest.ts so the console and this manifest can
// never disagree about what a customer asked for.

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const fam = searchParams.get("fam") ?? "";
  const q   = (searchParams.get("q") ?? "").toLowerCase();

  // select("*") rather than an explicit column list — payment_status/paid_at
  // may not exist yet depending on whether the payment-tracking migration
  // has been run; "*" returns whatever columns are actually there instead of
  // erroring on ones that aren't.
  const db = getSupabaseAdmin();
  const { data: orders, error } = await db
    .from("orders")
    .select("*")
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
    ...rows.map((o: any) => {
      const subtotal = o.price != null ? Number(o.price) : null;
      const { hst, total } = subtotal != null ? calculateHst(subtotal) : { hst: null, total: null };
      const { received, returned, missing, receivedDetails, returnedDetails } = getItemTracking(o.status_history);
      const details = [
        receivedDetails ? `In: ${receivedDetails}` : "",
        returnedDetails ? `Out: ${returnedDetails}` : "",
      ].filter(Boolean).join(" | ");
      return [
        o.code, o.status, o.payment_status ?? "unpaid", o.customer_name, o.email, o.phone,
        o.service_title ?? o.service,
        subtotal != null ? subtotal.toFixed(2) : "",
        hst != null ? hst.toFixed(2) : "",
        total != null ? total.toFixed(2) : "",
        o.paid_at ?? "",
        o.weight ?? "",
        received ?? "", returned ?? "", missing ?? "",
        received != null || returned != null ? (WASH_FAMILY.includes(o.service) ? "lb" : "items") : "",
        details,
        getDeliveryRequest(o.status_history) ?? "",
        o.date, o.time_slot, o.address,
        o.notes ?? "", o.created_at, o.updated_at,
      ].map(csvCell).join(",");
    }),
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
