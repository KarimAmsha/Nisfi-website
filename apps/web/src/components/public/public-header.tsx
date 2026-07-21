import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { BrandMark } from "@/components/ui/brand-mark";
import { buttonVariants } from "@/components/ui/button";

export function PublicHeader() {
  const t = useTranslations("Public.nav");
  const brand = useTranslations("Landing");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-ink">
          <BrandMark />
          <span className="text-lg">{brand("brand")}</span>
        </Link>
        <nav className="ms-4 hidden items-center gap-6 text-sm text-ink-600 md:flex">
          <a href="#how" className="hover:text-ink">
            {t("howItWorks")}
          </a>
          <a href="#principles" className="hover:text-ink">
            {t("principles")}
          </a>
          <a href="#faq" className="hover:text-ink">
            {t("faq")}
          </a>
        </nav>
        <div className="ms-auto flex items-center gap-2">
          <div className="hidden lg:block">
            <LocaleSwitcher />
          </div>
          <Link href="/app" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {t("login")}
          </Link>
          <Link href="/app" className={buttonVariants({ size: "sm" })}>
            {t("getStarted")}
          </Link>
        </div>
      </div>
    </header>
  );
}
