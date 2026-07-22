import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { MatchList } from "@/components/matches/match-list";

export default async function MatchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return <MatchList />;
}
