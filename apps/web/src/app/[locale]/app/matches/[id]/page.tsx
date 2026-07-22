import type { Metadata } from "next";
import type { Locale } from "@nisfi/shared";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ChatIcon } from "@/components/ui/icon";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// The real-time conversation is Unit 4.2; this is a placeholder so match links
// resolve to an honest "coming next" state rather than a 404.
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations({ locale: locale as Locale, namespace: "Matches" });
  return (
    <EmptyState
      icon={<ChatIcon size={22} />}
      title={t("chatSoonTitle")}
      description={t("chatSoonBody")}
      action={
        <Link href="/app/matches" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          {t("backToMatches")}
        </Link>
      }
    />
  );
}
