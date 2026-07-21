import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { ProfileOverview } from "@/components/profile/profile-overview";

export default async function MyProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <div className="mx-auto max-w-3xl">
      <ProfileOverview />
    </div>
  );
}
