import { NextResponse } from "next/server";
import { MANUAL_REVIEWS, PLACES_TEXT_QUERY, type Review } from "@/lib/reviews";
import { GOOGLE_REVIEWS } from "@/lib/site";

export const dynamic = "force-dynamic";
// Google's Places terms don't allow storing review content long term, so
// these are fetched fresh and held only briefly. 30 minutes keeps the page
// fast without the site showing a review the customer has since deleted.
export const revalidate = 1800;

/**
 * The actual words customers wrote, for the reviews section.
 *
 * Prefers the live Google Business Profile when GOOGLE_PLACES_API_KEY is set,
 * so the section stays current on its own. Falls back to reviews pasted into
 * lib/reviews.ts by hand. Returns an empty list when there are neither —
 * never a sample, never a placeholder.
 */
export async function GET() {
  const key = process.env.GOOGLE_PLACES_API_KEY;

  if (!key) {
    return NextResponse.json({
      source: MANUAL_REVIEWS.length ? "manual" : "none",
      reviews: MANUAL_REVIEWS,
      profileUrl: GOOGLE_REVIEWS.profileUrl || null,
    });
  }

  try {
    const placeId = process.env.GOOGLE_PLACE_ID || (await findPlaceId(key));
    if (!placeId) throw new Error("place not found");

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          // Field mask is required by the Places API and is also what keeps
          // the call cheap — only what the section actually renders.
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: 1800 },
      }
    );
    if (!res.ok) throw new Error(`places ${res.status}`);
    const data = await res.json();

    const reviews: Review[] = (data.reviews ?? [])
      .map((r: any) => ({
        // r.text.text is the review exactly as written. It is passed through
        // untouched — no trimming, no sentence-casing, no "cleanup".
        text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
        author: r.authorAttribution?.displayName ?? "Google reviewer",
        rating: Number(r.rating) || 0,
        relativeTime: r.relativePublishTimeDescription ?? undefined,
        photoUrl: r.authorAttribution?.photoUri ?? undefined,
        url: r.googleMapsUri ?? data.googleMapsUri ?? undefined,
      }))
      .filter((r: Review) => r.text.length > 0);

    return NextResponse.json({
      source: "google",
      reviews,
      rating: data.rating ?? null,
      reviewCount: data.userRatingCount ?? null,
      profileUrl: data.googleMapsUri ?? GOOGLE_REVIEWS.profileUrl ?? null,
    });
  } catch {
    // A failed lookup must never blank an otherwise working page, and must
    // never invent content — fall back to whatever was pasted in by hand.
    return NextResponse.json({
      source: MANUAL_REVIEWS.length ? "manual" : "none",
      reviews: MANUAL_REVIEWS,
      profileUrl: GOOGLE_REVIEWS.profileUrl || null,
    });
  }
}

/** Resolve the Business Profile from its name and city, so a key alone is
 *  enough to get started without hunting down a Place ID. */
async function findPlaceId(key: string): Promise<string | null> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({ textQuery: PLACES_TEXT_QUERY, maxResultCount: 1 }),
    next: { revalidate: 86400 },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.places?.[0]?.id ?? null;
}
