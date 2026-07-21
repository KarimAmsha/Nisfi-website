import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { FlagIcon } from "@/components/ui/icon";

export default function AdminReportsPage() {
  const t = useTranslations("Admin.reports");
  return (
    <AdminShell title={t("title")}>
      <EmptyState
        icon={<FlagIcon size={22} />}
        title={t("emptyTitle")}
        description={t("emptyDesc")}
      />
    </AdminShell>
  );
}
