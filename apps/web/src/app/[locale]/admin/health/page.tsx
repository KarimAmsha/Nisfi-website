import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { HealthView } from "@/components/admin/health-view";

export default function AdminHealthPage() {
  const t = useTranslations("Admin.health");
  return (
    <AdminShell title={t("title")}>
      <HealthView />
    </AdminShell>
  );
}
