import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { Resend } from "resend";
import { BUSINESS_NAME } from "@/lib/pricing";

export const dynamic = "force-dynamic";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  let body: { name: string; email: string; phone?: string; subject: string; message: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, phone, subject, message } = body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("contact_submissions")
    .insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() ?? null,
      subject: subject.trim(),
      message: message.trim(),
    });

  if (error) {
    console.error("Contact insert error:", error.message);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail && resend) {
    resend.emails.send({
      from: `${BUSINESS_NAME} <bookings@starexlaundry.ca>`,
      to: adminEmail,
      subject: `📩 New Contact: ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;">
          <h2 style="color:#1E5FA0;margin:0 0 16px">New Contact Submission</h2>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#374151;">
            <tr><td style="color:#6B7280;width:100px">Name</td><td><strong>${name}</strong></td></tr>
            <tr><td style="color:#6B7280">Email</td><td>${email}</td></tr>
            ${phone ? `<tr><td style="color:#6B7280">Phone</td><td>${phone}</td></tr>` : ""}
            <tr><td style="color:#6B7280">Subject</td><td>${subject}</td></tr>
          </table>
          <div style="background:#f9fafb;border-left:3px solid #1E5FA0;padding:16px;margin:16px 0;border-radius:4px;">
            <p style="margin:0;font-size:14px;color:#374151;">${message.replace(/\n/g, "<br>")}</p>
          </div>
          <p style="font-size:12px;color:#9CA3AF;">Reply directly to: <a href="mailto:${email}">${email}</a></p>
        </div>
      `,
    }).catch(() => {});
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
