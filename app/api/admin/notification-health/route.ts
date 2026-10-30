import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * Whether customers are actually receiving their notifications.
 *
 * notification_log has been written on every send since the start and read by
 * nothing — so when Meta disabled the WhatsApp sender in August, 142 messages
 * failed and the only person who noticed was the owner, in October, because
 * customers stopped replying. This endpoint reads it.
 */

const WINDOW_DAYS = 7;

export type NotificationHealth = {
  windowDays: number;
  channels: {
    channel: string;
    sent: number;
    failed: number;
    pending: number;
    lastSuccessAt: string | null;
    errorCodes: Record<string, number>;
  }[];
};

// A row is a success if WhatsApp/Resend confirmed it, a failure if the
// provider rejected it, and pending while we are still waiting for the
// delivery callback. "queued" is not success: that is the mistake that hid
// this for two months.
const SUCCESS = new Set(["sent", "delivered", "read"]);
const PENDING = new Set(["queued", "sending", "accepted", "skipped"]);

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("notification_log")
      .select("channel,status,created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) throw error;

    const byChannel = new Map<string, NotificationHealth["channels"][number]>();

    for (const row of data ?? []) {
      const channel = row.channel ?? "unknown";
      let c = byChannel.get(channel);
      if (!c) {
        c = { channel, sent: 0, failed: 0, pending: 0, lastSuccessAt: null, errorCodes: {} };
        byChannel.set(channel, c);
      }

      // Statuses arrive as "failed", or "undelivered (63112)" once the
      // delivery callback has attached Twilio's reason.
      const raw = (row.status ?? "").toLowerCase();
      const base = raw.replace(/\s*\(.*\)\s*$/, "").trim();
      const code = raw.match(/\((\d+)\)/)?.[1];

      if (SUCCESS.has(base)) {
        c.sent++;
        // Rows come back newest first, so the first success is the latest.
        if (!c.lastSuccessAt) c.lastSuccessAt = row.created_at;
      } else if (PENDING.has(base)) {
        c.pending++;
      } else {
        c.failed++;
        if (code) c.errorCodes[code] = (c.errorCodes[code] ?? 0) + 1;
      }
    }

    return NextResponse.json({
      windowDays: WINDOW_DAYS,
      channels: [...byChannel.values()].sort((a, b) => b.failed - a.failed),
    } satisfies NotificationHealth);
  } catch {
    // The table is optional (see supabase/schema.sql). An empty report is
    // honest here; claiming everything is fine is what caused the problem.
    return NextResponse.json({ windowDays: WINDOW_DAYS, channels: [] } satisfies NotificationHealth);
  }
}
