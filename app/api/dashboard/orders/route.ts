import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { OrderService } from "@/lib/services/order.service";

export const dynamic = "force-dynamic";

const stripBOM = (s: string) => s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;

export async function GET(_req: NextRequest) {
  // Verify session server-side via cookie
  const cookieStore = cookies();
  const supabase = createServerClient(
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""),
    stripBOM(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""),
    { cookies: { getAll: () => cookieStore.getAll() } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const service = new OrderService(getSupabaseAdmin());
    const orders = await service.getOrdersByUserId(user.id);
    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
