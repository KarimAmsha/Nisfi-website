import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { hasLocale, useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { PublicPage } from "@/components/public/public-page";
import { localeAlternates } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Contact" });
  return {
    title: t("title"),
    description: t("lead"),
    alternates: localeAlternates(locale, "/contact"),
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <ContactContent />;
}

function ContactContent() {
  const t = useTranslations("Contact");
  return (
    <PublicPage title={t("title")} lead={t("lead")}>
      <div className="rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed text-ink-600">
        <p>{t("channelsNote")}</p>
        <p className="mt-3 text-ink-600/80">{t("comingSoon")}</p>
      </div>
    </PublicPage>
  );
}
