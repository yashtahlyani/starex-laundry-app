import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";
import { BUSINESS_NAME } from "@/lib/pricing";
import { getAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ISSUE_TYPES = ["lost_item", "damage", "late_delivery", "billing", "quality", "other"] as const;
const PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export async function POST(req: NextRequest) {
  let body: {
    orderCode?: string;
    customerName: string;
    customerEmail: string;
    issueType: string;
    description: string;
    priority?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { orderCode, customerName, customerEmail, issueType, description, priority = "normal" } = body;

  if (!customerName?.trim() || !customerEmail?.trim() || !issueType || !description?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!ISSUE_TYPES.includes(issueType as typeof ISSUE_TYPES[number])) {
    return NextResponse.json({ error: "Invalid issue type" }, { status: 400 });
  }

  let orderId: string | null = null;
  if (orderCode) {
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id")
      .eq("order_code", orderCode.trim().toUpperCase())
      .maybeSingle();
    orderId = order?.id ?? null;
  }

  const { data: issue, error } = await supabaseAdmin
    .from("issues")
    .insert({
      order_id: orderId,
      order_code: orderCode?.trim().toUpperCase() ?? null,
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim().toLowerCase(),
      issue_type: issueType,
      description: description.trim(),
      priority: PRIORITIES.includes(priority as typeof PRIORITIES[number]) ? priority : "normal",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to submit issue" }, { status: 500 });
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail && resend) {
    const urgentTypes = ["lost_item", "damage"];
    const isUrgent = urgentTypes.includes(issueType);
    resend.emails.send({
      from: `${BUSINESS_NAME} <bookings@starexlaundry.ca>`,
      to: adminEmail,
      subject: `${isUrgent ? "🚨" : "⚠️"} Issue Reported${orderCode ? ` — Order ${orderCode}` : ""}: ${issueType.replace(/_/g, " ")}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;">
          <h2 style="color:#DC2626;margin:0 0 16px">${isUrgent ? "Urgent" : "New"} Issue Reported</h2>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#4A4A4A;">
            ${orderCode ? `<tr><td style="color:#6B7280;width:120px">Order</td><td><strong style="font-family:monospace">${orderCode}</strong></td></tr>` : ""}
            <tr><td style="color:#6B7280">Customer</td><td>${customerName} — ${customerEmail}</td></tr>
            <tr><td style="color:#6B7280">Type</td><td>${issueType.replace(/_/g, " ")}</td></tr>
            <tr><td style="color:#6B7280">Priority</td><td>${priority}</td></tr>
          </table>
          <div style="background:#fef2f2;border-left:3px solid #DC2626;padding:16px;margin:16px 0;border-radius:4px;">
            <p style="margin:0;font-size:14px;color:#4A4A4A;">${description.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="font-size:12px;color:#9CA3AF;">Issue ID: ${issue.id}</p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, issueId: issue.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseAdmin = getSupabaseAdmin();
  const url = req.nextUrl;
  const status = url.searchParams.get("status");
  const limit = parseInt(url.searchParams.get("limit") ?? "50");

  let query = supabaseAdmin
    .from("issues")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ issues: data ?? [] });
}
