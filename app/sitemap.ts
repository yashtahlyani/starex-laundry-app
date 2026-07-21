import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/site";

const BASE = SITE_ORIGIN;
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/book`,                lastModified: now, changeFrequency: "weekly",  priority: 0.95 },
    { url: `${BASE}/services`,            lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/pricing`,             lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/how-it-works`,        lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/about`,               lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/faq`,                 lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/contact`,             lastModified: now, changeFrequency: "monthly", priority: 0.7  },
    { url: `${BASE}/order`,               lastModified: now, changeFrequency: "weekly",  priority: 0.6  },
    { url: `${BASE}/terms`,               lastModified: now, changeFrequency: "yearly",  priority: 0.3  },
    { url: `${BASE}/privacy`,             lastModified: now, changeFrequency: "yearly",  priority: 0.3  },
  ];
}
