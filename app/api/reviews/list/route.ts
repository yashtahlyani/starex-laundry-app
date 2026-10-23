import { NextResponse } from "next/server";
import { MANUAL_REVIEWS } from "@/lib/reviews";
import { GOOGLE_REVIEWS } from "@/lib/site";
import { fetchGooglePlace } from "@/lib/googlePlaces";

export const dynamic = "force-dynamic";
// Google's terms don't allow storing review content long term, so these are
// fetched fresh and held only briefly. 30 minutes keeps the page fast without
// showing a review the customer has since deleted.
export const revalidate = 1800;

/**
 * The actual words customers wrote, for the reviews section.
 *
 * Prefers the live Google Business Profile when GOOGLE_PLACES_API_KEY is set.
 * Falls back to reviews pasted into lib/reviews.ts by hand. Returns an empty
 * list when there are neither — never a sample, never a placeholder.
 */
export async function GET() {
  const place = await fetchGooglePlace();

  if (place && place.reviews.length > 0) {
    return NextResponse.json({
      source: "google",
      reviews: place.reviews,
      rating: place.rating,
      reviewCount: place.reviewCount,
      profileUrl: place.profileUrl ?? GOOGLE_REVIEWS.profileUrl ?? null,
    });
  }

  // Google answered but returned no review text — that is the Atmosphere SKU
  // (billing) case, not a failure. Hand-entered reviews still show, and the
  // live rating is still passed on so the badge stays current.
  return NextResponse.json({
    source: MANUAL_REVIEWS.length ? "manual" : "none",
    reviews: MANUAL_REVIEWS,
    rating: place?.rating ?? null,
    reviewCount: place?.reviewCount ?? null,
    profileUrl: place?.profileUrl ?? GOOGLE_REVIEWS.profileUrl ?? null,
  });
}
