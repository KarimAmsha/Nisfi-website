import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import { InboxIcon } from "@/components/ui/icon";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function RequestsPage() {
  const t = useTranslations("Requests");
  const c = useTranslations("Common");
  return (
    <EmptyState
      icon={<InboxIcon size={22} />}
      title={t("emptyTitle")}
      description={t("emptyDesc")}
      action={
        <Link href="/app/discover" className={buttonVariants({ size: "sm" })}>
          {c("browseMembers")}
        </Link>
      }
    />
  );
}
