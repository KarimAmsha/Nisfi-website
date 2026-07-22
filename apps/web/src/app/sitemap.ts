import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { PUBLIC_PATHS, siteUrl } from "@/lib/seo";

/**
 * Sitemap of the public marketing pages, one entry per locale with hreflang
 * alternates (master spec Section 7 launch / SEO). Member, admin, and auth
 * areas are intentionally excluded — they are noindex and disallowed in
 * `robots.txt`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${base}/${routing.defaultLocale}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${base}/${locale}${path}`]),
      ),
    },
  }));
}
