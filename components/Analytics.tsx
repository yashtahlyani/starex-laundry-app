"use client";

import Script from "next/script";

/**
 * Google Analytics 4.
 *
 * The site had no analytics of any kind until 2 Nov 2026 — no GA, no Search
 * Console, nothing. Every question about traffic was unanswerable, which is
 * awkward given the privacy policy has promised since August that we use
 * "performance/analytics cookies (e.g., Google Analytics)" and retain usage
 * data for "typically 26 months" — 26 months being GA4's own default.
 * Installing this makes the site match what it already tells people.
 *
 * Renders nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so no tracking
 * happens and no cookies are dropped on a deployment without an ID. The
 * variable is NEXT_PUBLIC_, so it is baked in at build time: setting it needs
 * a redeploy to take effect.
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          // anonymize_ip is on because the policy commits to collecting only
          // "approximate location derived from IP address".
          gtag('config', '${id}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
