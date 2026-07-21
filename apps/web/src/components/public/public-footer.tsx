import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { BrandMark } from "@/components/ui/brand-mark";

export function PublicFooter() {
  const t = useTranslations("Public.footer");
  const nav = useTranslations("Public.nav");
  const brand = useTranslations("Landing")("brand");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 font-bold text-ink">
            <BrandMark />
            <span className="text-lg">{brand}</span>
          </div>
          <p className="mt-3 max-w-[36ch] text-sm text-ink-600">{t("tagline")}</p>
          <div className="mt-5">
            <LocaleSwitcher />
          </div>
        </div>

        <nav aria-label={t("product")}>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-600">
            {t("product")}
          </h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink">
            <li>
              <a href="#how" className="hover:text-primary-700">
                {nav("howItWorks")}
              </a>
            </li>
            <li>
              <a href="#principles" className="hover:text-primary-700">
                {nav("principles")}
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-primary-700">
                {nav("faq")}
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-600">
            {t("legal")}
          </h4>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-ink-600">
            <li>{t("privacy")}</li>
            <li>{t("terms")}</li>
          </ul>
          <p className="mt-3 text-xs text-ink-600">{t("draftNote")}</p>
        </div>
      </div>

      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-ink-600">
          {brand} — © {year}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
