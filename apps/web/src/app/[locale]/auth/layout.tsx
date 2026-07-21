import type { ReactNode } from "react";
import { hasLocale, useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/locale-switcher";

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-canvas px-4 py-10">
      {children}
      <AuthFooter />
    </div>
  );
}

function AuthFooter() {
  const t = useTranslations("Auth");
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="max-w-sm text-center text-xs text-ink-600">{t("legalNote")}</p>
      <LocaleSwitcher />
    </div>
  );
}
