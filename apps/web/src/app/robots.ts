import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { PRIVATE_PATH_SEGMENTS, siteUrl } from "@/lib/seo";

/**
 * robots.txt (master spec Section 7 launch / SEO). Public marketing pages are
 * crawlable; the member / admin / auth / onboarding / status areas are
 * disallowed for every locale (they are also noindex at the page level).
 */
export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  const disallow = routing.locales.flatMap((locale) =>
    PRIVATE_PATH_SEGMENTS.map((segment) => `/${locale}/${segment}`),
  );

  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
