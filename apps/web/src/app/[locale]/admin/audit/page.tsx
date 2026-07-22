import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { AuditExplorer } from "@/components/admin/audit-explorer";

export default function AdminAuditPage() {
  const t = useTranslations("Admin.audit");
  return (
    <AdminShell title={t("title")}>
      <AuditExplorer />
    </AdminShell>
  );
}
