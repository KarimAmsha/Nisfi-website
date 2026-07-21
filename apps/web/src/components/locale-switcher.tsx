"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

/**
 * Locale switcher: links to the current path in each supported locale.
 * Uses next-intl navigation so the URL stays prefixed (`/ar`, `/en`, `/tr`).
 */
export function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2" aria-label={t("label")}>
      <span className="me-1 text-sm text-ink-600">{t("label")}</span>
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={pathname}
          locale={locale}
          aria-current={locale === activeLocale ? "true" : undefined}
          className={cn(
            "rounded-md border px-3 py-1.5 text-sm transition-colors",
            locale === activeLocale
              ? "border-primary/40 bg-primary-50 text-primary-700"
              : "border-border text-ink hover:border-primary hover:text-primary-700",
          )}
        >
          {t(locale)}
        </Link>
      ))}
    </nav>
  );
}
