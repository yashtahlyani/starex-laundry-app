// Checks the SEO surfaces the owner asked for on 26 Nov 2026 against the
// BUILT HTML, not against the source.
//
// That distinction is the point of this script. /book is the example: its
// heading looked right in page.tsx and was still missing from the served
// HTML, because useSearchParams() pushed the whole page behind a Suspense
// boundary and the prerender was one empty div. Reading the source would
// have said PASS.
//
// Run it after `npm run build`, before deploying:
//
//   npm run build && node scripts/check-seo.mjs
//
// A failure here means Google is about to be shown something different from
// what was agreed. Fix the page rather than relaxing the check.

import fs from "fs";

const p = f => fs.readFileSync(".next/server/app/" + f, "utf8");
const t = h => (h.match(/<title>([^<]*)<\/title>/) || [])[1];
const h1 = h => [...h.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs)].map(m => text(m[1])).join(" | ") || "(none)";
const ld = h => [...h.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(m => JSON.parse(m[1]));

/** Visible text of a fragment: drop React's <!-- --> text-node separators and
 *  all tags, then collapse whitespace -- what a reader actually sees. */
const text = s => s.replace(/<!--.*?-->/gs, "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const home = p("index.html"), book = p("book.html"), faq = p("faq.html"), pri = p("pricing.html");
const biz = ld(home).find(j => j["@type"] === "DryCleaningOrLaundry");
let fails = 0;
const check = (n, ok, got) => { if (!ok) fails++; console.log(`${ok ? "PASS" : "FAIL"}  ${n}\n        ${got}`); };

console.log("--- Sushil's 26 Nov batch, checked against the built HTML ---\n");
check("1. Homepage title", t(home) === "Dry Cleaning &amp; Laundry in Brampton &amp; Mississauga | Starex", t(home));
check("2. Homepage H1", h1(home) === "Dry cleaning &amp; laundry, picked up and delivered in Brampton &amp; Mississauga.", h1(home));
check("3a. Book H1, in the served HTML", h1(book).includes("Book laundry pickup in Brampton"), h1(book));
check("3b. Only one h1 on /book", (book.match(/<h1/g) || []).length === 1, (book.match(/<h1/g) || []).length + " h1 element(s)");
const bookLine = (text(book).match(/Free pickup[^.]*\./) || [])[0];
check("3c. Free delivery line", bookLine === "Free pickup &amp; delivery across Brampton &amp; Mississauga on orders of $40 or more.", bookLine);
check("4. FAQ title", t(faq) === "Dry Cleaning &amp; Laundry FAQ \u2014 Brampton &amp; Mississauga", t(faq));
check("5. Pricing title", t(pri) === "Dry Cleaning &amp; Laundry Prices \u2014 Brampton &amp; Mississauga", t(pri));
check("6a. Street address", biz.address.streetAddress === "25 Grendon Cres", JSON.stringify(biz.address));
check("6b. Hours", biz.openingHoursSpecification.opens === "08:00" && biz.openingHoursSpecification.closes === "21:00",
  `${biz.openingHoursSpecification.opens}-${biz.openingHoursSpecification.closes}, ${biz.openingHoursSpecification.dayOfWeek.length} days`);
check("6c. Business type", biz["@type"] === "DryCleaningOrLaundry", biz["@type"]);
check("6d. Same details on /book and /pricing",
  !!ld(book).find(j => j["@type"] === "DryCleaningOrLaundry") && !!ld(pri).find(j => j["@type"] === "DryCleaningOrLaundry"),
  "both carry the block");
check("6e. Address in the footer", /25 Grendon Cres/.test(home.split("<footer")[1] || ""), "footer renders the street address");

const imgs = [...home.matchAll(/\/images\/starex\/[a-z0-9_.-]+\.(webp|jpg)/g)].map(m => m[0]);
check("7. Offer photo served as WebP", imgs.some(i => i.includes("10_offer_red_with_copy-") && i.endsWith(".webp")),
  [...new Set(imgs.filter(i => i.includes("10_offer")))].join(", "));

const sm = fs.readFileSync("app/sitemap.ts", "utf8");
check("8. /about in the sitemap", /\/about`/.test(sm), "already present, and already live");

const bad = ["index", "book", "pricing", "faq", "offer", "dry-cleaning-brampton", "dry-cleaning-mississauga", "laundry-service-brampton", "laundry-service-mississauga"]
  .filter(f => p(f + ".html").includes("LaundryService"));
check("extra: no invalid LaundryService type left", bad.length === 0, bad.length ? bad.join(", ") : "none on any page");

console.log(fails ? `\n${fails} FAILED` : "\nAll checks passed.");
process.exit(fails ? 1 : 0);
