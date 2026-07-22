import type { Locale } from "@nisfi/shared";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminShell } from "@/components/shell/admin-shell";
import { ReportsQueue } from "@/components/admin/reports-queue";

export default async function AdminReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Admin.reports" });
  return (
    <AdminShell title={t("title")}>
      <ReportsQueue />
    </AdminShell>
  );
}
