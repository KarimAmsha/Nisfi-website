import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { UsersAdmin } from "@/components/admin/users-admin";

export default function AdminUsersPage() {
  const t = useTranslations("Admin.users");
  return (
    <AdminShell title={t("title")}>
      <UsersAdmin />
    </AdminShell>
  );
}
