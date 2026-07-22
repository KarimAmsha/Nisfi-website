import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { ExportsAdmin } from "@/components/admin/exports-admin";

export default function AdminExportsPage() {
  const t = useTranslations("Admin.exports");
  return (
    <AdminShell title={t("title")}>
      <ExportsAdmin />
    </AdminShell>
  );
}
