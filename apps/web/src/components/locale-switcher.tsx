"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Locale switcher: links to the current path in each supported locale.
 * Uses next-intl navigation so the locale prefix is applied correctly and the
 * URL remains prefixed (`/ar`, `/en`, `/tr`) in every language.
 */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav className="switcher" aria-label={t("label")}>
      <span className="switcher__label">{t("label")}</span>
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          className="switcher__link"
          aria-current={locale === activeLocale ? "true" : undefined}
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  );
}
