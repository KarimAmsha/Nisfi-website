/**
 * Supported application locales (master spec Sections 4 and 13).
 * Arabic is the default and is rendered right-to-left.
 */
export const LOCALES = ["ar", "en", "tr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "ar";

/** Text direction per locale; only Arabic is RTL in V1. */
export type Direction = "rtl" | "ltr";

export function directionForLocale(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/**
 * A value expressed in every supported locale. Used for localized product
 * content (question bank, plan names, config copy) as defined in Section 10.
 */
export type Localized<T = string> = Record<Locale, T>;
