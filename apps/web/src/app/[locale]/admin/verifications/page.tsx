import type { Locale } from "@nisfi/shared";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminShell } from "@/components/shell/admin-shell";
import { VerificationQueue } from "@/components/admin/verification-queue";

export default async function AdminVerificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Admin.verifications" });
  return (
    <AdminShell title={t("title")}>
      <VerificationQueue />
    </AdminShell>
  );
}
