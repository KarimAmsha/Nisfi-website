import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { ConfigAdmin } from "@/components/admin/config-admin";

export default function AdminConfigPage() {
  const t = useTranslations("Admin.config");
  return (
    <AdminShell title={t("title")}>
      <ConfigAdmin />
    </AdminShell>
  );
}
