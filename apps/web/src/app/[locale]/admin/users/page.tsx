import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { UsersIcon } from "@/components/ui/icon";

export default function AdminUsersPage() {
  const t = useTranslations("Admin.users");
  return (
    <AdminShell title={t("title")}>
      <EmptyState
        icon={<UsersIcon size={22} />}
        title={t("emptyTitle")}
        description={t("emptyDesc")}
      />
    </AdminShell>
  );
}
