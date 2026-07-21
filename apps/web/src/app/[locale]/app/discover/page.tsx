import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { DiscoveryBrowser } from "@/components/discovery/discovery-browser";

export default async function DiscoverPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <DiscoveryBrowser />;
}
