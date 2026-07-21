import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { IBM_Plex_Sans_Arabic, Inter } from "next/font/google";
import { directionForLocale } from "@nisfi/shared";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/lib/auth-context";
import "../globals.css";

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const latinFont = Inter({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nisfi — نِصفي",
  description: "Privacy-first, verification-first marriage-intent matchmaking.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const direction = directionForLocale(locale);

  return (
    <html lang={locale} dir={direction} className={`${arabicFont.variable} ${latinFont.variable}`}>
      <body>
        <NextIntlClientProvider>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
