import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { RequestCenter } from "@/components/requests/request-center";

export default async function RequestsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <RequestCenter />;
}
