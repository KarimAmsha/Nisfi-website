import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { buttonVariants } from "@/components/ui/button";

type LandingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <LandingContent />;
}

function LandingContent() {
  const t = useTranslations("Landing");

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="inline-block rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-ink-600">
        {t("status")}
      </span>
      <h1 className="text-5xl font-bold tracking-tight text-ink sm:text-6xl">{t("brand")}</h1>
      <p className="max-w-[42ch] text-lg text-ink">{t("tagline")}</p>
      <p className="max-w-[46ch] leading-relaxed text-ink-600">{t("intro")}</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/app" className={buttonVariants()}>
          {t("enterApp")}
        </Link>
        <Link href="/admin" className={buttonVariants({ variant: "ghost" })}>
          {t("openAdmin")}
        </Link>
      </div>
      <LocaleSwitcher />
    </main>
  );
}
