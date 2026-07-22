import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
        <span className="text-5xl font-bold text-primary-700">404</span>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-ink">{t("title")}</h1>
          <p className="text-sm leading-relaxed text-ink-600">{t("body")}</p>
        </div>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {t("home")}
        </Link>
      </div>
    </div>
  );
}
