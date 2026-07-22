"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

/**
 * Localized error boundary for the locale segment. Rendered inside the locale
 * layout, so translations and fonts are available. In production the error
 * message is generic (no stack/internal details leak to the user).
 */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("ErrorPage");

  useEffect(() => {
    // A hook point for client error reporting (wired at production, O-001).
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
        <span className="grid size-14 place-items-center rounded-full bg-danger/10 text-2xl text-danger">
          !
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-ink">{t("title")}</h1>
          <p className="text-sm leading-relaxed text-ink-600">{t("body")}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {t("retry")}
        </button>
      </div>
    </div>
  );
}
