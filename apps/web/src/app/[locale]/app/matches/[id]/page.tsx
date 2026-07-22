import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { Conversation } from "@/components/matches/conversation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);
  return <Conversation matchId={id} />;
}
