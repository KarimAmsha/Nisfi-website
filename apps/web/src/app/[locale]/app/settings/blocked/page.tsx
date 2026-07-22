import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { BlockedList } from "@/components/settings/blocked-list";

export default async function BlockedPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <BlockedList />;
}
