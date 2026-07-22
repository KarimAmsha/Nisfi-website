import type { Locale } from "@nisfi/shared";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { AdminShell } from "@/components/shell/admin-shell";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Admin.dashboard" });
  return (
    <AdminShell title={t("title")}>
      <AdminDashboard />
    </AdminShell>
  );
}
