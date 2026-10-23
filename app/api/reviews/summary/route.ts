import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { GOOGLE_REVIEWS } from "@/lib/site";

export const dynamic = "force-dynamic";
// Ratings move slowly and this sits next to the booking button, so a short
// cache keeps it off the critical path without ever being meaningfully stale.
export const revalidate = 0;

// Below this many ratings the average says more about the sample than the
// service, and "5.0 from 2 reviews" reads as less trustworthy than showing
// nothing at all — so the badge stays hidden until there are enough.
const MIN_RATINGS = 5;

/**
 * Trust signal for the booking flow (per client, 2026-10-14: "near the booking
 * button can we show google review to increase the trust?").
 *
 * Prefers the real Google Business Profile rating once the owner supplies it
 * in lib/site.ts. Until then it falls back to Starex's own ratings, which are
 * first-party and verifiable: each one comes from a real delivered order, left
 * by the customer on their own tracking page.
 *
 * It never invents a number. With too few ratings it returns show:false and
 * the badge renders nothing.
 */
export async function GET() {
  // A Places API key, when set, is the best source: it is Google's own
  // current figure, so the hand-entered numbers below stop drifting as
  // reviews come in. Falls through to them if the call fails.
  if (process.env.GOOGLE_PLACES_API_KEY) {
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/reviews/list`, { next: { revalidate: 1800 } });
      if (r.ok) {
        const d = await r.json();
        if (d.source === "google" && d.rating != null && d.reviewCount != null) {
          return NextResponse.json({
            show: true,
            source: "google",
            average: Math.round(Number(d.rating) * 10) / 10,
            count: d.reviewCount,
            profileUrl: d.profileUrl ?? GOOGLE_REVIEWS.profileUrl ?? null,
          });
        }
      }
    } catch {
      // fall through to the configured values
    }
  }

  if (GOOGLE_REVIEWS.ratingValue != null && GOOGLE_REVIEWS.reviewCount != null) {
    return NextResponse.json({
      show: true,
      source: "google",
      average: GOOGLE_REVIEWS.ratingValue,
      count: GOOGLE_REVIEWS.reviewCount,
      profileUrl: GOOGLE_REVIEWS.profileUrl || null,
    });
  }

  try {
    const db = getSupabaseAdmin();
    const { data, error } = await db
      .from("orders")
      .select("rating")
      .not("rating", "is", null);
    if (error) throw error;

    const ratings = (data ?? [])
      .map((r: any) => Number(r.rating))
      .filter((n: number) => Number.isFinite(n) && n >= 1 && n <= 5);

    if (ratings.length < MIN_RATINGS) {
      return NextResponse.json({ show: false });
    }

    const average = Math.round((ratings.reduce((s, n) => s + n, 0) / ratings.length) * 10) / 10;
    return NextResponse.json({
      show: true,
      source: "starex",
      average,
      count: ratings.length,
      profileUrl: GOOGLE_REVIEWS.profileUrl || null,
    });
  } catch {
    // A trust badge is decoration on a booking page — if this query fails the
    // customer should still be able to book, so it fails silently to hidden.
    return NextResponse.json({ show: false });
  }
}
