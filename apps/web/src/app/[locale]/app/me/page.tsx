import type { Locale } from "@nisfi/shared";
import { setRequestLocale } from "next-intl/server";
import { PhotoManager } from "@/components/photos/photo-manager";

export default async function MyProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  return (
    <div className="mx-auto max-w-3xl">
      <PhotoManager />
    </div>
  );
}
