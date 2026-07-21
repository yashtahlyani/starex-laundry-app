import { Resend } from "resend";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { BUSINESS_NAME } from "./pricing";

// Undefined until RESEND_API_KEY is set — email sends are skipped gracefully until then,
// same as the Twilio WhatsApp path below.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// The address emails are sent from. Set RESEND_FROM_EMAIL to an address on a
// domain you've verified in Resend (e.g. bookings@starexlaundry.ca) to send to
// real customers. Until then it falls back to Resend's shared test sender,
// which can only deliver to the Resend account owner's own address — enough for
// owner alerts, but customer confirmations will be rejected until a domain is
// verified. Exported so every send site (here + the issues route) stays in sync.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export const FROM_EMAIL = `${BUSINESS_NAME} <${FROM_ADDRESS}>`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://starexlaundry.ca";

// Customer-supplied text (names, addresses, messages) goes into HTML emails —
// escape it so a crafted booking can't inject markup into the owner's inbox.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type BookingNotificationPayload = {
  orderId: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  pickupDate: string;
  pickupTimeSlot: string;
  pickupAddress: string;
};

// Status change messages sent to the customer. Keys must match VALID_STATUSES
// in lib/services/order.service.ts, not an arbitrary label.
const STATUS_MESSAGES: Partial<Record<string, { subject: string; body: string; whatsapp: string }>> = {
  confirmed: {
    subject: "Your booking is confirmed!",
    body: "We've confirmed your pickup and locked in your slot.",
    whatsapp: "Your booking is confirmed! We'll see you at pickup.",
  },
  picked_up: {
    subject: "We've picked up your laundry!",
    body: "Your laundry has been picked up and is on its way to us. We'll notify you when it's ready.",
    whatsapp: "We've picked up your laundry and are getting it cleaned. We'll message you when it's ready!",
  },
  washing: {
    subject: "Your laundry is being cleaned!",
    body: "Your items are in the wash now — we'll let you know as soon as they're ready.",
    whatsapp: "Your laundry is being cleaned right now. Hang tight!",
  },
  folding: {
    subject: "Your laundry is clean and ready!",
    body: "Great news — your laundry is freshly cleaned and folded. Our driver will be heading your way soon.",
    whatsapp: "Your laundry is clean and ready! Our driver will be on the way to you shortly.",
  },
  out_for_delivery: {
    subject: "Your laundry is out for delivery!",
    body: "Your order is on its way back to you. Expect delivery soon.",
    whatsapp: "Your laundry is out for delivery — it'll be with you soon!",
  },
  delivered: {
    subject: "Your laundry has been delivered!",
    body: "Your order has been delivered. Thank you for choosing Starex — we hope to see you again soon!",
    whatsapp: "Your laundry has been delivered! Thanks for choosing Starex. See you next time!",
  },
};

// Called right after a booking is created
export async function sendBookingConfirmation(payload: BookingNotificationPayload) {
  await Promise.allSettled([
    sendBookingEmail(payload),
    sendBookingWhatsApp(payload),
  ]);
}

// Called when staff updates order status
export async function sendStatusNotification(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  newStatus: string
) {
  const msg = STATUS_MESSAGES[newStatus];
  if (!msg) return; // not all status changes warrant a customer notification

  await Promise.allSettled([
    sendStatusEmail(orderId, orderCode, customerName, customerEmail, newStatus, msg),
    sendStatusWhatsApp(orderId, orderCode, customerName, customerPhone, newStatus, msg),
  ]);
}

// ─── Owner notifications ────────────────────────────────────────────────────
// Alerts the owner's inbox on new activity, so they don't have to keep
// refreshing /admin to notice a new booking or message. Set
// ADMIN_NOTIFICATION_EMAIL (and RESEND_API_KEY) in the environment to enable —
// both are optional and this no-ops silently until they're set.

export async function notifyOwnerOfNewOrder(p: BookingNotificationPayload) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail || !resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `New booking — Order ${p.orderCode} (${formatService(p.serviceType)})`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;">
          <h2 style="color:#B8324F;margin:0 0 16px">New Booking Received</h2>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#4A4A4A;">
            <tr><td style="color:#6B7280;width:120px">Order</td><td><strong style="font-family:monospace">${p.orderCode}</strong></td></tr>
            <tr><td style="color:#6B7280">Customer</td><td>${escapeHtml(p.customerName)} — ${escapeHtml(p.customerEmail)} — ${escapeHtml(p.customerPhone)}</td></tr>
            <tr><td style="color:#6B7280">Service</td><td>${formatService(p.serviceType)}</td></tr>
            <tr><td style="color:#6B7280">Pickup</td><td>${formatDate(p.pickupDate)} · ${escapeHtml(p.pickupTimeSlot)}</td></tr>
            <tr><td style="color:#6B7280">Address</td><td>${escapeHtml(p.pickupAddress)}</td></tr>
          </table>
          <a href="${SITE_URL}/admin" style="display:inline-block;margin-top:16px;color:#B8324F;">Open Admin Console →</a>
        </div>
      `,
    });
  } catch {
    // Best-effort — never block the booking flow on a notification failure.
  }
}

export async function notifyOwnerOfNewContact(p: { name: string; email: string; subject?: string | null; message: string }) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail || !resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `New contact message${p.subject ? `: ${p.subject}` : ""}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;">
          <h2 style="color:#B8324F;margin:0 0 16px">New Contact Message</h2>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#4A4A4A;">
            <tr><td style="color:#6B7280;width:120px">From</td><td>${escapeHtml(p.name)} — ${escapeHtml(p.email)}</td></tr>
            ${p.subject ? `<tr><td style="color:#6B7280">Subject</td><td>${escapeHtml(p.subject)}</td></tr>` : ""}
          </table>
          <div style="background:#fdf2f4;border-left:3px solid #B8324F;padding:16px;margin:16px 0;border-radius:4px;">
            <p style="margin:0;font-size:14px;color:#4A4A4A;">${escapeHtml(p.message).replace(/\n/g, "<br>")}</p>
          </div>
          <a href="${SITE_URL}/admin?tab=contacts" style="display:inline-block;color:#B8324F;">Open Admin Console →</a>
        </div>
      `,
    });
  } catch {
    // Best-effort — never block the contact form on a notification failure.
  }
}

// ─── Email helpers ────────────────────────────────────────────────────────────

async function sendBookingEmail(p: BookingNotificationPayload) {
  if (!resend) {
    await logNotification(p.orderId, "email", "booking_confirmed", "skipped");
    return;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: p.customerEmail,
      subject: `Booking confirmed — Order ${p.orderCode}`,
      html: buildBookingEmailHtml(p),
    });
    await logNotification(p.orderId, "email", "booking_confirmed", error ? "failed" : "sent", data?.id);
  } catch {
    await logNotification(p.orderId, "email", "booking_confirmed", "failed");
  }
}

async function sendStatusEmail(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerEmail: string,
  status: string,
  msg: { subject: string; body: string }
) {
  if (!resend) {
    await logNotification(orderId, "email", status, "skipped");
    return;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `${msg.subject} — Order ${orderCode}`,
      html: buildStatusEmailHtml(customerName, orderCode, msg.body),
    });
    await logNotification(orderId, "email", status, error ? "failed" : "sent", data?.id);
  } catch {
    await logNotification(orderId, "email", status, "failed");
  }
}

// ─── WhatsApp helpers (Twilio REST API — no SDK needed) ──────────────────────

async function sendBookingWhatsApp(p: BookingNotificationPayload) {
  const body =
    `Hi ${p.customerName}! Your ${BUSINESS_NAME} booking is confirmed.\n\n` +
    `Order ID: *${p.orderCode}*\n` +
    `Service: ${formatService(p.serviceType)}\n` +
    `Pickup window: ${formatDate(p.pickupDate)} · ${p.pickupTimeSlot}\n` +
    `Address: ${p.pickupAddress}\n\n` +
    `Track your order: ${SITE_URL}/order\n\n` +
    `Questions? Just reply to this message.`;

  await dispatchWhatsApp(p.orderId, p.customerPhone, body, "booking_confirmed");
}

async function sendStatusWhatsApp(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerPhone: string,
  status: string,
  msg: { whatsapp: string }
) {
  const body =
    `Hi ${customerName}! ${msg.whatsapp}\n\n` +
    `Order: *${orderCode}*\n` +
    `Track: ${SITE_URL}/order`;

  await dispatchWhatsApp(orderId, customerPhone, body, status);
}

async function dispatchWhatsApp(orderId: string, phone: string, body: string, eventType: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!sid || !token || !from) {
    // WhatsApp not configured yet — skip silently
    await logNotification(orderId, "whatsapp", eventType, "skipped");
    return;
  }

  const to = phone.startsWith("whatsapp:") ? phone : `whatsapp:+${phone.replace(/\D/g, "")}`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        },
        body: new URLSearchParams({ From: from, To: to, Body: body }).toString(),
      }
    );
    const data = await res.json();
    await logNotification(orderId, "whatsapp", eventType, res.ok ? "sent" : "failed", data?.sid);
  } catch {
    await logNotification(orderId, "whatsapp", eventType, "failed");
  }
}

// ─── Notification log ─────────────────────────────────────────────────────────

// Best-effort audit trail — the notification_log table is optional (see
// supabase/schema.sql). If it hasn't been created in this environment yet,
// this must not throw and break the actual booking/status-update flow.
async function logNotification(
  orderId: string,
  channel: string,
  eventType: string,
  status: string,
  providerMessageId?: string
) {
  try {
    await getSupabaseAdmin().from("notification_log").insert({
      order_id: orderId,
      channel,
      event_type: eventType,
      status,
      provider_message_id: providerMessageId ?? null,
    });
  } catch {
    // No-op — logging is diagnostic only, never load-bearing.
  }
}

// ─── Formatting utilities ─────────────────────────────────────────────────────

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-CA", {
    timeZone: "America/Toronto",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatService(id: string) {
  return id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Email HTML templates ─────────────────────────────────────────────────────

function emailShell(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${BUSINESS_NAME}</title>
</head>
<body style="margin:0;padding:20px;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#B8324F;padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">${BUSINESS_NAME}</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Laundry &amp; Dry Cleaning · Canada</p>
          </td>
        </tr>
        <tr><td style="padding:32px 40px;">${content}</td></tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #eef0f2;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:12px;">Questions? Reply to this email or WhatsApp us directly.</p>
            <p style="margin:8px 0 0;color:#ccc;font-size:11px;">© ${new Date().getFullYear()} ${BUSINESS_NAME}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildBookingEmailHtml(p: BookingNotificationPayload) {
  const content = `
    <h2 style="margin:0 0 6px;color:#1a1a2e;font-size:20px;">Booking Confirmed!</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.5;">
      Hi ${escapeHtml(p.customerName)}, your pickup is all set. Here's everything you need to know:
    </p>

    <div style="background:#FBEEF1;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;vertical-align:top;">Order ID</td>
          <td style="padding:8px 0;text-align:right;font-family:monospace;font-size:16px;font-weight:700;color:#B8324F;">${p.orderCode}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid rgba(0,0,0,0.06);">Service</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;border-top:1px solid rgba(0,0,0,0.06);">${formatService(p.serviceType)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid rgba(0,0,0,0.06);vertical-align:top;">Pickup window</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;border-top:1px solid rgba(0,0,0,0.06);">${formatDate(p.pickupDate)}<br><span style="font-weight:400;color:#888;">${escapeHtml(p.pickupTimeSlot)}</span></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid rgba(0,0,0,0.06);">Address</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;border-top:1px solid rgba(0,0,0,0.06);">${escapeHtml(p.pickupAddress)}</td>
        </tr>
      </table>
    </div>

    <div style="border-left:3px solid #3FA796;background:#f7faf9;border-radius:0 8px 8px 0;padding:14px 16px;margin:0 0 28px;">
      <p style="margin:0;font-size:13px;color:#444;line-height:1.6;">
        <strong>What to do:</strong> Please have your laundry ready in a bag by your door before the pickup window starts.
        You'll receive a WhatsApp message and email at each step of the process.
      </p>
    </div>

    <a href="${SITE_URL}/order"
       style="display:block;background:#B8324F;color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
      Track My Order →
    </a>`;

  return emailShell(content);
}

function buildStatusEmailHtml(customerName: string, orderCode: string, bodyText: string) {
  const content = `
    <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.5;">Hi ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 24px;color:#1a1a2e;font-size:16px;line-height:1.6;font-weight:500;">${bodyText}</p>
    <p style="margin:0 0 28px;color:#888;font-size:13px;">Order: <span style="font-family:monospace;font-weight:700;color:#B8324F;">${orderCode}</span></p>
    <a href="${SITE_URL}/order"
       style="display:block;background:#B8324F;color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
      Track My Order →
    </a>`;

  return emailShell(content);
}
