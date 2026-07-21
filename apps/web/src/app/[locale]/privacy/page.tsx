import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PublicPage, PublicSection } from "@/components/public/public-page";
import { LegalDraftBanner } from "@/components/public/legal-draft-banner";
import { localeAlternates } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Legal.privacy" });
  return {
    title: t("title"),
    description: t("intro"),
    alternates: localeAlternates(locale, "/privacy"),
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <PrivacyContent />;
}

function PrivacyContent() {
  const t = useTranslations("Legal.privacy");
  return (
    <PublicPage title={t("title")} lead={t("intro")}>
      <LegalDraftBanner />
      <PublicSection title={t("s1Title")}>{t("s1Body")}</PublicSection>
      <PublicSection title={t("s2Title")}>{t("s2Body")}</PublicSection>
      <PublicSection title={t("s3Title")}>{t("s3Body")}</PublicSection>
    </PublicPage>
  );
}
