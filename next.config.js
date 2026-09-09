/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // www and the apex domain both resolve to live, identical content (see the
  // domain-attachment fix, 2026-09-09) — without this, Google can index both
  // as separate pages and split ranking signals. Redirect www to the one
  // canonical hostname instead of just hinting at it via <link rel=canonical>.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.starexlaundrydryclean.ca" }],
        destination: "https://starexlaundrydryclean.ca/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stops the admin console (and everything else) from being iframed
          // for clickjacking.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
