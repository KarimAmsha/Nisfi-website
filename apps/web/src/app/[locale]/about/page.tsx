import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PublicPage, PublicSection } from "@/components/public/public-page";
import { localeAlternates } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "About" });
  return {
    title: t("title"),
    description: t("lead"),
    alternates: localeAlternates(locale, "/about"),
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("About");
  return (
    <PublicPage title={t("title")} lead={t("lead")}>
      <PublicSection title={t("missionTitle")}>{t("missionBody")}</PublicSection>
      <PublicSection title={t("notTitle")}>{t("notBody")}</PublicSection>
      <PublicSection title={t("valuesTitle")}>
        <ul className="mt-1 flex flex-col gap-2">
          <li>• {t("v1")}</li>
          <li>• {t("v2")}</li>
          <li>• {t("v3")}</li>
        </ul>
      </PublicSection>
    </PublicPage>
  );
}
