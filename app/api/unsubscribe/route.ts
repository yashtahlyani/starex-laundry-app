import { NextRequest } from "next/server";
import { verifyUnsubscribeToken, recordOptOut } from "@/lib/emailOptOut";
import { CONTACT } from "@/lib/site";
import { BUSINESS_NAME, PHONE } from "@/lib/pricing";

export const dynamic = "force-dynamic";

/**
 * One-click unsubscribe from marketing email.
 *
 * No sign-in, no confirmation step, no "tell us why". CASL requires the
 * unsubscribe to be simple and to work; anything that makes a person click
 * twice to leave is how a business earns a complaint instead of a quiet
 * exit.
 *
 * Answers in HTML rather than JSON because this URL is opened by a human
 * from their inbox, not by code.
 *
 * Also handles POST, which is what a mail client sends when the reader uses
 * its own "unsubscribe" button via the List-Unsubscribe-Post header.
 */

function page(title: string, body: string, ok: boolean) {
  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${title} | ${BUSINESS_NAME}</title>
<style>
  :root { color-scheme: light; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#FFFFFF; color:#161616; font-family:system-ui,-apple-system,"Segoe UI",sans-serif; padding:24px; }
  .card { max-width:460px; text-align:center; }
  h1 { font-size:1.4rem; margin:0 0 12px; }
  p { color:#4A4A4A; line-height:1.7; font-size:0.95rem; margin:0 0 10px; }
  .mark { width:46px; height:46px; border-radius:50%; margin:0 auto 18px;
          display:flex; align-items:center; justify-content:center; font-size:22px;
          background:${ok ? "#F0FDF4" : "#FFF7ED"}; color:${ok ? "#16A34A" : "#C2410C"}; }
  a { color:#B30F14; }
</style></head><body><div class="card">
<div class="mark">${ok ? "&#10003;" : "!"}</div>
<h1>${title}</h1>
${body}
<p style="margin-top:18px;font-size:0.85rem;color:#8C8C8C">
  ${BUSINESS_NAME} &middot; <a href="mailto:${CONTACT.email}">${CONTACT.email}</a> &middot; ${PHONE}
</p>
</div></body></html>`,
    { status: ok ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

async function handle(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("t") ?? "";
  const email = verifyUnsubscribeToken(token);

  if (!email) {
    return page(
      "That link didn't work",
      `<p>We couldn't read that unsubscribe link - it may have been cut short by your email app.</p>
       <p>Email <a href="mailto:${CONTACT.email}">${CONTACT.email}</a> or call ${PHONE} and we'll take you off the list straight away.</p>`,
      false
    );
  }

  const done = await recordOptOut(email, "black-friday-2026");

  if (!done) {
    return page(
      "Something went wrong",
      `<p>We couldn't record that just now. Please email <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
        or call ${PHONE} and we'll remove you by hand - you will not be emailed again either way.</p>`,
      false
    );
  }

  return page(
    "You're unsubscribed",
    `<p><strong>${email}</strong> will not receive any more marketing email from us.</p>
     <p>You'll still get the messages about orders you place - your booking confirmation,
        when your laundry is ready, and your receipt. Those aren't marketing, and we'd be
        leaving you in the dark without them.</p>
     <p>Changed your mind, or unsubscribed by accident? Just reply to any of our emails.</p>`,
    true
  );
}

export async function GET(req: NextRequest) { return handle(req); }

/** Mail clients that honour List-Unsubscribe-Post send a POST here when the
 *  reader uses their built-in unsubscribe button. */
export async function POST(req: NextRequest) { return handle(req); }
