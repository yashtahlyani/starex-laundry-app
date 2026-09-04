import { Resend } from "resend";
import { getSupabaseAdmin } from "./supabaseAdmin";
import { BUSINESS_NAME } from "./pricing";
import { SITE_ORIGIN } from "./site";

// Undefined until RESEND_API_KEY is set — email sends are skipped gracefully until then,
// same as the Twilio WhatsApp path below.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// The address emails are sent from. Set RESEND_FROM_EMAIL to an address on a
// domain you've verified in Resend (e.g. bookings@starexlaundrydryclean.ca) to send to
// real customers. Until then it falls back to Resend's shared test sender,
// which can only deliver to the Resend account owner's own address — enough for
// owner alerts, but customer confirmations will be rejected until a domain is
// verified. Exported so every send site (here + the issues route) stays in sync.
const FROM_ADDRESS = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
export const FROM_EMAIL = `${BUSINESS_NAME} <${FROM_ADDRESS}>`;
// Reuses the same https-only guard as SEO surfaces — a stray
// NEXT_PUBLIC_SITE_URL=http://localhost in the deploy environment must never
// leak into a real customer's email as their "Track My Order" link.
const SITE_URL = SITE_ORIGIN;

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
//
// Reordered per client request (2026-08-16): Confirmed now happens AFTER
// Picked Up. Picked Up fires the moment the courier collects the order —
// it's explicitly NOT a verification, so its copy says so directly.
// Confirmed only fires once staff have received, verified, weighed, and
// priced the order (see the AppOrderDrawer payment panel, gated to appear
// starting at Confirmed) — refined again 2026-08-18 per client to drop the
// "checked in" phrasing and make clear Picked Up isn't yet verified. Ready
// for Delivery prompts payment instead of just saying the driver is on the
// way, since delivery isn't dispatched until payment clears.
const STATUS_MESSAGES: Partial<Record<string, { subject: string; body: string; whatsapp: string }>> = {
  picked_up: {
    subject: "We've picked up your laundry!",
    body: "Your laundry has been picked up from your door. It hasn't been verified yet — we'll notify you again once we've received and confirmed it at our facility.",
    whatsapp: "We've picked up your laundry from your door. It hasn't been verified yet — we'll message you again once we've received and confirmed it.",
  },
  confirmed: {
    subject: "Your order has been verified!",
    body: "We've received and verified your order — cleaning is now underway.",
    whatsapp: "We've received and verified your order — cleaning is now underway. We'll message you when it's ready!",
  },
  ready_for_delivery: {
    subject: "Your order is ready — please complete payment",
    body: "Your laundry is cleaned and ready! Please complete payment now so we can schedule your delivery.",
    whatsapp: "Your laundry is ready! Please complete payment now so we can schedule your delivery.",
  },
  delivered: {
    subject: "Your laundry has been delivered!",
    body: "Your order has been delivered. Thank you for choosing Starex — we hope to see you again soon!",
    whatsapp: "Your laundry has been delivered! Thanks for choosing Starex. See you next time!",
  },
  cancelled: {
    subject: "Your order has been cancelled",
    body: "Your order has been cancelled. If this wasn't expected or you have any questions, just reply to this email and we'll sort it out.",
    whatsapp: "Your order has been cancelled. If this wasn't expected or you have any questions, just reply to this message and we'll sort it out.",
  },
};

// Called right after a booking is created
export async function sendBookingConfirmation(payload: BookingNotificationPayload) {
  await Promise.allSettled([
    sendBookingEmail(payload),
    sendBookingWhatsApp(payload),
  ]);
}

// Called when staff updates order status. `note` is an optional discrepancy
// or flag (e.g. "one shirt has a stain that won't fully lift") staff can
// attach to the transition — it's folded into this same email/WhatsApp send
// rather than requiring a second "Notify customer" message, so the customer
// gets one combined update instead of two separate ones for the same event.
export async function sendStatusNotification(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  newStatus: string,
  note?: string | null
) {
  const msg = STATUS_MESSAGES[newStatus];
  if (!msg) return; // not all status changes warrant a customer notification

  await Promise.allSettled([
    sendStatusEmail(orderId, orderCode, customerName, customerEmail, newStatus, msg, note),
    sendStatusWhatsApp(orderId, orderCode, customerName, customerPhone, newStatus),
  ]);
}

// Confirms a successful charge — distinct from the pipeline status
// messages, since payment can clear at any point from Confirmed through
// Ready for Delivery and isn't itself a status change. Called from all
// three payment-success paths: the admin's "Charge Card", "Mark Paid"
// (manual), and the customer's own "Pay Now". Doubles as the order's
// invoice — an itemized subtotal/HST/total breakdown, not just a thank-you.
const LEGAL_NAME = "Royal Art Treasure Inc.";

export async function sendPaymentReceived(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  breakdown: { subtotal: number; hst: number; total: number }
) {
  await Promise.allSettled([
    sendPaymentReceivedEmail(orderId, orderCode, customerName, customerEmail, breakdown),
    dispatchWhatsApp(orderId, customerPhone, "payment_received", {
      "1": customerName,
      "2": orderCode,
      "3": breakdown.total.toFixed(2),
    }),
  ]);
}

async function sendPaymentReceivedEmail(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerEmail: string,
  { subtotal, hst, total }: { subtotal: number; hst: number; total: number }
) {
  if (!resend) {
    await logNotification(orderId, "email", "payment_received", "skipped");
    return;
  }
  const hstNumber = process.env.HST_REGISTRATION_NUMBER;
  const row = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding:6px 0;color:${bold ? "#1a1a2e" : "#666"};font-size:${bold ? "15px" : "13px"};font-weight:${bold ? 700 : 400};">${label}</td>
      <td style="padding:6px 0;text-align:right;color:${bold ? "#1a1a2e" : "#333"};font-size:${bold ? "15px" : "13px"};font-weight:${bold ? 700 : 600};">${value}</td>
    </tr>`;
  const content = `
    <p style="margin:0 0 4px;color:#555;font-size:15px;line-height:1.5;">Hi ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 24px;color:#1a1a2e;font-size:16px;line-height:1.6;font-weight:500;">We've received your payment — thank you!</p>
    <div style="background:#f7f7fa;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
      <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:0.04em;">Invoice</p>
      <p style="margin:0 0 16px;color:#1a1a2e;font-size:15px;font-weight:600;">${LEGAL_NAME}${hstNumber ? ` — HST# ${escapeHtml(hstNumber)}` : ""}</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;color:#666;font-size:13px;">Order</td><td style="padding:4px 0;text-align:right;font-family:monospace;font-weight:700;color:#ED1D24;font-size:14px;">${orderCode}</td></tr>
        ${row("Subtotal", `$${subtotal.toFixed(2)} CAD`)}
        ${row("HST (13%)", `$${hst.toFixed(2)} CAD`)}
        ${row("Total paid", `$${total.toFixed(2)} CAD`, true)}
      </table>
    </div>
    <p style="margin:0 0 28px;color:#888;font-size:13px;">We'll notify you once your order is out for delivery.</p>
    <a href="${SITE_URL}/order"
       style="display:block;background:#ED1D24;color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
      Track My Order →
    </a>`;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Payment received — thank you! — Order ${orderCode}`,
      html: emailShell(content),
    });
    await logNotification(orderId, "email", "payment_received", error ? "failed" : "sent", data?.id);
  } catch {
    await logNotification(orderId, "email", "payment_received", "failed");
  }
}

// Ad-hoc note to a specific customer about their order — e.g. a garment
// discrepancy staff spotted before processing ("this stain won't fully
// remove", "returning unprocessed — fabric too damaged to clean safely").
// Independent of the status pipeline: doesn't require a status change, just
// a message the customer needs to see. Called from the admin console's
// order drawer.
export async function sendCustomerNote(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  message: string
) {
  await Promise.allSettled([
    sendCustomerNoteEmail(orderId, orderCode, customerName, customerEmail, message),
    dispatchWhatsApp(orderId, customerPhone, "custom_note", {
      "1": customerName,
      "2": orderCode,
      "3": message,
    }),
  ]);
}

async function sendCustomerNoteEmail(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerEmail: string,
  message: string
) {
  if (!resend) {
    await logNotification(orderId, "email", "custom_note", "skipped");
    return;
  }
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `A note about your order — ${orderCode}`,
      html: buildStatusEmailHtml(customerName, orderCode, escapeHtml(message).replace(/\n/g, "<br>")),
    });
    await logNotification(orderId, "email", "custom_note", error ? "failed" : "sent", data?.id);
  } catch {
    await logNotification(orderId, "email", "custom_note", "failed");
  }
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
          <h2 style="color:#ED1D24;margin:0 0 16px">New Booking Received</h2>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#4A4A4A;">
            <tr><td style="color:#6B7280;width:120px">Order</td><td><strong style="font-family:monospace">${p.orderCode}</strong></td></tr>
            <tr><td style="color:#6B7280">Customer</td><td>${escapeHtml(p.customerName)} — ${escapeHtml(p.customerEmail)} — ${escapeHtml(p.customerPhone)}</td></tr>
            <tr><td style="color:#6B7280">Service</td><td>${formatService(p.serviceType)}</td></tr>
            <tr><td style="color:#6B7280">Pickup</td><td>${formatDate(p.pickupDate)} · ${escapeHtml(p.pickupTimeSlot)}</td></tr>
            <tr><td style="color:#6B7280">Address</td><td>${escapeHtml(p.pickupAddress)}</td></tr>
          </table>
          <a href="${SITE_URL}/admin" style="display:inline-block;margin-top:16px;color:#ED1D24;">Open Admin Console →</a>
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
          <h2 style="color:#ED1D24;margin:0 0 16px">New Contact Message</h2>
          <table width="100%" cellpadding="6" cellspacing="0" style="font-size:14px;color:#4A4A4A;">
            <tr><td style="color:#6B7280;width:120px">From</td><td>${escapeHtml(p.name)} — ${escapeHtml(p.email)}</td></tr>
            ${p.subject ? `<tr><td style="color:#6B7280">Subject</td><td>${escapeHtml(p.subject)}</td></tr>` : ""}
          </table>
          <div style="background:#fdf2f4;border-left:3px solid #ED1D24;padding:16px;margin:16px 0;border-radius:4px;">
            <p style="margin:0;font-size:14px;color:#4A4A4A;">${escapeHtml(p.message).replace(/\n/g, "<br>")}</p>
          </div>
          <a href="${SITE_URL}/admin?tab=contacts" style="display:inline-block;color:#ED1D24;">Open Admin Console →</a>
        </div>
      `,
    });
  } catch {
    // Best-effort — never block the contact form on a notification failure.
  }
}

export async function notifyOwnerOfLowRating(orderCode: string, rating: number) {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!adminEmail || !resend) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `${rating}★ rating on order ${orderCode} — worth a follow-up`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;">
          <h2 style="color:#ED1D24;margin:0 0 16px">Low Rating Received</h2>
          <p style="font-size:14px;color:#4A4A4A;">Order <strong style="font-family:monospace">${escapeHtml(orderCode)}</strong> was rated <strong>${rating} out of 5</strong> by the customer. Might be worth reaching out.</p>
          <a href="${SITE_URL}/admin?tab=orders&q=${encodeURIComponent(orderCode)}" style="display:inline-block;margin-top:12px;color:#ED1D24;">Open Admin Console →</a>
        </div>
      `,
    });
  } catch {
    // Best-effort — never block the rating submission on a notification failure.
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
  msg: { subject: string; body: string },
  note?: string | null
) {
  if (!resend) {
    await logNotification(orderId, "email", status, "skipped");
    return;
  }
  const body = note?.trim()
    ? `${msg.body}<br><br><strong>A note about your order:</strong><br>${escapeHtml(note.trim()).replace(/\n/g, "<br>")}`
    : msg.body;
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `${msg.subject} — Order ${orderCode}`,
      html: buildStatusEmailHtml(customerName, orderCode, body),
    });
    await logNotification(orderId, "email", status, error ? "failed" : "sent", data?.id);
  } catch {
    await logNotification(orderId, "email", status, "failed");
  }
}

// ─── WhatsApp helpers (Twilio REST API — no SDK needed) ──────────────────────

// Customers type their phone as a plain 10-digit number ("4165551234", not
// "+14165551234") — the service area is entirely Ontario, Canada. Just
// stripping non-digits and prepending "+" drops the required NANP "1"
// country code, producing an invalid number that Twilio can't deliver to.
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

// WhatsApp Business requires every business-initiated message (the customer
// never messages us first) to use a pre-approved Content Template — a
// freeform Body is rejected outright (Twilio error 63016). Each status maps
// to a Content SID from an approved template (see supabase/whatsapp-templates
// for the exact wording submitted); set once Meta approves each one.
const WHATSAPP_TEMPLATES: Record<string, string | undefined> = {
  booking_confirmed:  process.env.TWILIO_TEMPLATE_BOOKING_CONFIRMED,
  picked_up:          process.env.TWILIO_TEMPLATE_PICKED_UP,
  confirmed:          process.env.TWILIO_TEMPLATE_CONFIRMED,
  ready_for_delivery: process.env.TWILIO_TEMPLATE_READY_FOR_DELIVERY,
  delivered:          process.env.TWILIO_TEMPLATE_DELIVERED,
  cancelled:          process.env.TWILIO_TEMPLATE_CANCELLED,
  custom_note:        process.env.TWILIO_TEMPLATE_CUSTOM_NOTE,
  payment_received:   process.env.TWILIO_TEMPLATE_PAYMENT_RECEIVED,
};

async function sendBookingWhatsApp(p: BookingNotificationPayload) {
  await dispatchWhatsApp(p.orderId, p.customerPhone, "booking_confirmed", {
    "1": p.customerName,
    "2": p.orderCode,
    "3": formatService(p.serviceType),
    "4": `${formatDate(p.pickupDate)} · ${p.pickupTimeSlot}`,
    "5": p.pickupAddress,
  });
}

async function sendStatusWhatsApp(
  orderId: string,
  orderCode: string,
  customerName: string,
  customerPhone: string,
  status: string
) {
  // The optional discrepancy note (e.g. a stain that won't remove) doesn't
  // fit a fixed-slot approved template — it still goes out over email, which
  // has no such restriction.
  await dispatchWhatsApp(orderId, customerPhone, status, {
    "1": customerName,
    "2": orderCode,
  });
}

async function dispatchWhatsApp(orderId: string, phone: string, eventType: string, variables: Record<string, string>) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;
  const contentSid = WHATSAPP_TEMPLATES[eventType];
  // Auth can be Account SID + Auth Token (classic), or Account SID + a
  // scoped API Key SID/Secret — Twilio accepts either as HTTP Basic Auth
  // against the same endpoint. Prefer the API Key if both are set.
  const authUser = process.env.TWILIO_API_KEY_SID || sid;
  const authPass = process.env.TWILIO_API_KEY_SECRET || process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !authUser || !authPass || !from || !contentSid) {
    // WhatsApp not configured yet, or this event's template isn't approved yet — skip silently
    await logNotification(orderId, "whatsapp", eventType, "skipped");
    return;
  }

  const to = phone.startsWith("whatsapp:") ? phone : `whatsapp:${toE164(phone)}`;

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${authUser}:${authPass}`).toString("base64")}`,
        },
        body: new URLSearchParams({ From: from, To: to, ContentSid: contentSid, ContentVariables: JSON.stringify(variables) }).toString(),
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
          <td style="background:#ED1D24;padding:28px 40px;text-align:center;">
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
          <td style="padding:8px 0;text-align:right;font-family:monospace;font-size:16px;font-weight:700;color:#ED1D24;">${p.orderCode}</td>
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
       style="display:block;background:#ED1D24;color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
      Track My Order →
    </a>`;

  return emailShell(content);
}

function buildStatusEmailHtml(customerName: string, orderCode: string, bodyText: string) {
  const content = `
    <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.5;">Hi ${escapeHtml(customerName)},</p>
    <p style="margin:0 0 24px;color:#1a1a2e;font-size:16px;line-height:1.6;font-weight:500;">${bodyText}</p>
    <p style="margin:0 0 28px;color:#888;font-size:13px;">Order: <span style="font-family:monospace;font-weight:700;color:#ED1D24;">${orderCode}</span></p>
    <a href="${SITE_URL}/order"
       style="display:block;background:#ED1D24;color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:8px;font-weight:600;font-size:15px;">
      Track My Order →
    </a>`;

  return emailShell(content);
}
