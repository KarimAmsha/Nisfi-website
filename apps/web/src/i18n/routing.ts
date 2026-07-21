import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "@nisfi/shared";

/**
 * next-intl routing configuration (master spec Sections 9 and 13).
 * Locales and the Arabic default come from the shared package so the app,
 * functions, and routing stay on a single source of truth.
 * `localePrefix: "always"` keeps the URL prefix present on every route
 * (`/ar`, `/en`, `/tr`).
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});
