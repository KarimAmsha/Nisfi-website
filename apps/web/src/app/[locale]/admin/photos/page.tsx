import type { Locale } from "@nisfi/shared";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminShell } from "@/components/shell/admin-shell";
import { PhotoQueue } from "@/components/admin/photo-queue";

export default async function AdminPhotosPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Admin.photos" });
  return (
    <AdminShell title={t("title")}>
      <PhotoQueue />
    </AdminShell>
  );
}
