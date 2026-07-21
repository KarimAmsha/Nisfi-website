import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/locale-switcher";

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
    <main className="shell">
      <span className="shell__badge">{t("status")}</span>
      <h1 className="shell__brand">{t("brand")}</h1>
      <p className="shell__tagline">{t("tagline")}</p>
      <p className="shell__intro">{t("intro")}</p>
      <LocaleSwitcher />
    </main>
  );
}
