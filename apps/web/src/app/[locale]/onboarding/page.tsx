import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { useTranslations } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RequireAuth } from "@/components/auth/auth-gate";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { localeAlternates } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: "Onboarding" });
  return {
    title: t("title"),
    alternates: localeAlternates(locale, "/onboarding"),
    robots: { index: false },
  };
}

export default async function OnboardingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <RequireAuth>
      <OnboardingContent />
    </RequireAuth>
  );
}

function OnboardingContent() {
  const t = useTranslations("Onboarding");
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto max-w-xl px-4 py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-ink text-balance">{t("title")}</h1>
          <p className="mt-1 text-sm text-ink-600">{t("subtitle")}</p>
        </header>
        <OnboardingWizard />
      </div>
    </div>
  );
}
