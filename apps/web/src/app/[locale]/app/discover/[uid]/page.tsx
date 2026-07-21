import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { ProfileDetail } from "@/components/discovery/profile-detail";

// Member profiles must never be indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CandidateProfilePage({
  params,
}: {
  params: Promise<{ locale: string; uid: string }>;
}) {
  const { locale, uid } = await params;
  setRequestLocale(locale as Locale);
  return <ProfileDetail uid={uid} />;
}
