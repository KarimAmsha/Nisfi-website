import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailContent } from "@/components/auth/verify-email-content";
import { localeAlternates } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Auth.verify" });
  return {
    title: t("title"),
    alternates: localeAlternates(locale, "/auth/verify-email"),
    robots: { index: false },
  };
}

export default async function VerifyEmailPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <VerifyEmailPageContent />;
}

function VerifyEmailPageContent() {
  const t = useTranslations("Auth.verify");
  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <VerifyEmailContent />
    </AuthCard>
  );
}
