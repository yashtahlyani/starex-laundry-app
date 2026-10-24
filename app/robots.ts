import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/account"],
      },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    // Points AI crawlers at the plain-text business summary. Not part of the
    // robots.txt spec, so it is emitted as a trailing comment line rather
    // than a directive a parser could choke on.
    host: SITE_ORIGIN,
  };
}
