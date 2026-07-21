import type { Metadata } from "next";

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
