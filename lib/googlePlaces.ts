import { GOOGLE_PLACE_ID, PLACES_TEXT_QUERY, type Review } from "./reviews";

/**
 * One place that talks to the Google Places API.
 *
 * Both /api/reviews/list and /api/reviews/summary need the same figures. The
 * summary route used to get them by calling the list route over HTTP, which
 * silently never worked: the URL came from NEXT_PUBLIC_SITE_URL, and
 * NEXT_PUBLIC_ values are inlined at BUILD time, so at runtime it was
 * fetching the production site rather than itself and quietly falling back to
 * the hand-typed rating. A shared function has no base URL to get wrong.
 */

export type PlacesResult = {
  rating: number | null;
  reviewCount: number | null;
  profileUrl: string | null;
  reviews: Review[];
};

/**
 * Returns null when there is no key or the call fails — callers then fall
 * back to their configured values rather than showing nothing.
 *
 * Note on `reviews`: rating and count come back on the standard tier, but
 * review TEXT belongs to the "Enterprise + Atmosphere" SKU and needs billing
 * enabled on the Cloud project. Without it Google returns HTTP 200 and simply
 * omits the field — no error, so this returns an empty array rather than
 * treating it as a failure.
 */
export async function fetchGooglePlace(): Promise<PlacesResult | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return null;

  try {
    const placeId = process.env.GOOGLE_PLACE_ID || GOOGLE_PLACE_ID || (await findPlaceId(key));
    if (!placeId) return null;

    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,googleMapsUri,reviews",
        },
        next: { revalidate: 1800 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();

    const reviews: Review[] = (data.reviews ?? [])
      .map((r: any) => ({
        // Passed through untouched — the customer's own words, spelling and
        // line breaks. originalText is preferred over text because `text` can
        // be Google's translation of a review written in another language.
        text: (r.originalText?.text ?? r.text?.text ?? "").trim(),
        author: r.authorAttribution?.displayName ?? "Google reviewer",
        rating: Number(r.rating) || 0,
        relativeTime: r.relativePublishTimeDescription ?? undefined,
        photoUrl: r.authorAttribution?.photoUri ?? undefined,
        url: r.googleMapsUri ?? data.googleMapsUri ?? undefined,
      }))
      .filter((r: Review) => r.text.length > 0);

    return {
      rating: data.rating ?? null,
      reviewCount: data.userRatingCount ?? null,
      profileUrl: data.googleMapsUri ?? null,
      reviews,
    };
  } catch {
    return null;
  }
}

/** Finds the profile by name and city, so a key alone is enough to start. */
async function findPlaceId(key: string): Promise<string | null> {
  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({ textQuery: PLACES_TEXT_QUERY, maxResultCount: 1 }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.places?.[0]?.id ?? null;
  } catch {
    return null;
  }
}
