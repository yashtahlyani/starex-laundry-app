import { Resend } from "resend";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { BUSINESS_NAME } from "./pricing";

// Undefined until RESEND_API_KEY is set — email sends are skipped gracefully until then,
// same as the Twilio WhatsApp path below.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// The domain the email comes from. Update once you have a verified domain in Resend.
const FROM_EMAIL = `${BUSINESS_NAME} <bookings@starexlaundry.ca>`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://starexlaundry.ca";

export type BookingNotificationPayload = {
  orderId: string;
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceType: string;
  pickupSlotStart: string;
  pickupSlotEnd: string;
  pickupAddress: string;
};

// Status change messages sent to the customer
const STATUS_MESSAGES: Partial<Record<string, { subject: string; body: string; whatsapp: string }>> = {
  picked_up: {
    subject: "We've picked up your laundry!",
    body: "Your laundry has been picked up and is on its way to us. We'll notify you when it's ready.",
    whatsapp: "We've picked up your laundry and are getting it cleaned. We'll message you when it's ready!",
  },
  ready: {
    subject: "Your laundry is clean and ready!",
    body: "Great news — your laundry is freshly cleaned and ready. Our driver will be heading your way soon.",
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

// ─── Email helpers ────────────────────────────────────────────────────────────

async function sendBookingEmail(p: BookingNotificationPayload) {
  if (!resend) {
    await logNotification(p.orderId, "email", "booking_confirmed", "skipped");
    return;
  }
  const { pickupStart, pickupEnd } = formatSlot(p.pickupSlotStart, p.pickupSlotEnd);
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: p.customerEmail,
      subject: `Booking confirmed — Order ${p.orderCode}`,
      html: buildBookingEmailHtml(p, pickupStart, pickupEnd),
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
  const { pickupStart, pickupEnd } = formatSlot(p.pickupSlotStart, p.pickupSlotEnd);
  const body =
    `Hi ${p.customerName}! Your ${BUSINESS_NAME} booking is confirmed.\n\n` +
    `Order ID: *${p.orderCode}*\n` +
    `Service: ${formatService(p.serviceType)}\n` +
    `Pickup window: ${pickupStart} – ${pickupEnd}\n` +
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

async function logNotification(
  orderId: string,
  channel: string,
  eventType: string,
  status: string,
  providerMessageId?: string
) {
  await getSupabaseAdmin().from("notification_log").insert({
    order_id: orderId,
    channel,
    event_type: eventType,
    status,
    provider_message_id: providerMessageId ?? null,
  });
}

// ─── Formatting utilities ─────────────────────────────────────────────────────

function formatSlot(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { timeZone: "America/Toronto" };
  const pickupStart = new Date(start).toLocaleString("en-CA", {
    ...opts,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const pickupEnd = new Date(end).toLocaleTimeString("en-CA", {
    ...opts,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { pickupStart, pickupEnd };
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
          <td style="background:#2E5F8A;padding:28px 40px;text-align:center;">
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

function buildBookingEmailHtml(
  p: BookingNotificationPayload,
  pickupStart: string,
  pickupEnd: string
) {
  const content = `
    <h2 style="margin:0 0 6px;color:#1a1a2e;font-size:20px;">Booking Confirmed!</h2>
    <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.5;">
      Hi ${p.customerName}, your pickup is all set. Here's everything you need to know:
    </p>

    <div style="background:#EAF2F8;border-radius:10px;padding:20px 24px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;vertical-align:top;">Order ID</td>
          <td style="padding:8px 0;text-align:right;font-family:monospace;font-size:16px;font-weight:700;color:#2E5F8A;">${p.orderCode}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid rgba(0,0,0,0.06);">Service</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;border-top:1px solid rgba(0,0,0,0.06);">${formatService(p.serviceType)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid rgba(0,0,0,0.06);vertical-align:top;">Pickup window</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;border-top:1px solid rgba(0,0,0,0.06);">${pickupStart}<br><span style="font-weight:400;color:#888;">until ${pickupEnd}</span></td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid rgba(0,0,0,0.06);">Address</td>
          <td style="padding:8px 0;text-align:right;font-weight:600;font-size:14px;border-top:1px solid rgba(0,0,0,0.06);">${p.pickupAddress}</td>
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
       style="display:block;background:#2E5F8A;color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
      Track My Order →
    </a>`;

  return emailShell(content);
}

function buildStatusEmailHtml(customerName: string, orderCode: string, bodyText: string) {
  const content = `
    <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.5;">Hi ${customerName},</p>
    <p style="margin:0 0 24px;color:#1a1a2e;font-size:16px;line-height:1.6;font-weight:500;">${bodyText}</p>
    <p style="margin:0 0 28px;color:#888;font-size:13px;">Order: <span style="font-family:monospace;font-weight:700;color:#2E5F8A;">${orderCode}</span></p>
    <a href="${SITE_URL}/order"
       style="display:block;background:#2E5F8A;color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
      Track My Order →
    </a>`;

  return emailShell(content);
}
