import { useTranslations } from "next-intl";
import { EmptyState } from "@/components/ui/empty-state";
import { ChatIcon } from "@/components/ui/icon";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function MatchesPage() {
  const t = useTranslations("Matches");
  const c = useTranslations("Common");
  return (
    <EmptyState
      icon={<ChatIcon size={22} />}
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
