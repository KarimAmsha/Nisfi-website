import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { localeAlternates } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Auth.register" });
  return {
    title: t("title"),
    alternates: localeAlternates(locale, "/auth/register"),
    robots: { index: false },
  };
}

export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <RegisterPageContent />;
}

function RegisterPageContent() {
  const t = useTranslations("Auth.register");
  return (
    <AuthCard title={t("title")} subtitle={t("subtitle")}>
      <RegisterForm />
    </AuthCard>
  );
}
