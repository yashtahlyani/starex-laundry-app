/**
 * Google Analytics 4 — rendered into the served HTML, deliberately.
 *
 * The first version used next/script with strategy="afterInteractive". That
 * works for collecting data (the tag loads and fires once the page hydrates),
 * but Next emits only `<link rel="preload" href=".../gtag/js?id=...">` into
 * the HTML and injects the real tag from JavaScript afterwards. Google Search
 * Console's "Google Analytics" verification reads the raw HTML and never runs
 * the page's JavaScript, so it found no tracking code and refused to verify
 * the site (reported by the owner, 5 Nov 2026).
 *
 * So this is a plain server-rendered snippet: the standard gtag.js tag,
 * present in <head> of the HTML as Google expects to find it. No next/script,
 * and no "use client" — adding either puts us back where we started.
 *
 * Renders nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is set, so a deployment
 * without an ID drops no cookies. That variable is inlined at build time, so
 * changing it needs a redeploy.
 */
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${id}', { anonymize_ip: true });`,
        }}
      />
    </>
  );
}
