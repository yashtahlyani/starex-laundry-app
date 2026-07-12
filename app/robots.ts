import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/dashboard", "/account"],
      },
    ],
    sitemap: "https://starex-laundry-app-v2.vercel.app/sitemap.xml",
  };
}
