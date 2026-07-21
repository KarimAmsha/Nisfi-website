import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import { BellIcon } from "@/components/ui/icon";

export default function NotificationsPage() {
  const t = useTranslations("Notifications");
  return (
    <EmptyState
      icon={<BellIcon size={22} />}
      title={t("emptyTitle")}
      description={t("emptyDesc")}
    />
  );
}
