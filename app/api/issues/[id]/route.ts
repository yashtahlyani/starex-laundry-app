import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { getAdminUser } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

const VALID_STATUSES = ["open", "in_review", "resolved", "closed"] as const;
const VALID_PRIORITIES = ["low", "normal", "high", "urgent"] as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseAdmin = getSupabaseAdmin();

  let body: { status?: string; priority?: string; resolution_note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.status) {
    if (!VALID_STATUSES.includes(body.status as typeof VALID_STATUSES[number])) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    updates.status = body.status;
    if (body.status === "resolved" || body.status === "closed") {
      updates.resolved_at = new Date().toISOString();
      updates.resolved_by = admin.email;
    }
  }

  if (body.priority) {
    if (!VALID_PRIORITIES.includes(body.priority as typeof VALID_PRIORITIES[number])) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }
    updates.priority = body.priority;
  }

  if (body.resolution_note !== undefined) {
    updates.resolution_note = body.resolution_note;
  }

  const { data, error } = await supabaseAdmin
    .from("issues")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true, issue: data });
}
