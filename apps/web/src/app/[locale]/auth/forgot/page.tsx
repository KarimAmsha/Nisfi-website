import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { ForgotForm } from "@/components/auth/forgot-form";
import { localeAlternates } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Auth.forgot" });
  return {
    title: t("title"),
    alternates: localeAlternates(locale, "/auth/forgot"),
    robots: { index: false },
  };
}

export default async function ForgotPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <ForgotPageContent />;
}

function ForgotPageContent() {
  const t = useTranslations("Auth.forgot");
  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <ForgotForm />
    </AuthCard>
  );
}
