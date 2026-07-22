import type { Metadata } from "next";

/** Public marketing paths that belong in the sitemap (locale prefix added per
 * locale). Keep in sync with the public routes in `app/[locale]/**`. */
export const PUBLIC_PATHS = ["", "/about", "/contact", "/privacy", "/terms"] as const;

/** Locale-prefixed areas that must never be indexed (member/admin/auth flows). */
export const PRIVATE_PATH_SEGMENTS = [
  "app",
  "admin",
  "auth",
  "onboarding",
  "status",
] as const;

/** The canonical site origin. Set `NEXT_PUBLIC_SITE_URL` at production wiring
 * (O-001); a stable placeholder keeps absolute URLs well-formed until then. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://nisfi.app").replace(/\/+$/, "");
}

/** Localized canonical + hreflang alternates for a public marketing path. */
export function localeAlternates(locale: string, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ar: `/ar${path}`,
      en: `/en${path}`,
      tr: `/tr${path}`,
    },
  };
}
