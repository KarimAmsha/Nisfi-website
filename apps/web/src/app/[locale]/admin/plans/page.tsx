import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { PlansAdmin } from "@/components/admin/plans-admin";

export default function AdminPlansPage() {
  const t = useTranslations("Admin.plans");
  return (
    <AdminShell title={t("title")}>
      <PlansAdmin />
    </AdminShell>
  );
}
