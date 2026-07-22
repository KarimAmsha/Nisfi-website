import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { BroadcastsAdmin } from "@/components/admin/broadcasts-admin";

export default function AdminBroadcastsPage() {
  const t = useTranslations("Admin.broadcasts");
  return (
    <AdminShell title={t("title")}>
      <BroadcastsAdmin />
    </AdminShell>
  );
}
