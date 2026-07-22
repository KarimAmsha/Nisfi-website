"use client";

import { useTranslations } from "next-intl";
import { otherUid } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatIcon, LockIcon } from "@/components/ui/icon";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMatches } from "@/lib/use-matches";
import { PREVIEW_VIEWER } from "@/lib/discovery-preview";

export function MatchList() {
  const t = useTranslations("Matches");
  const c = useTranslations("Common");
  const { configured, user } = useAuth();
  const viewerUid = configured ? user?.uid : PREVIEW_VIEWER.uid;
  const { matches, loading, error, preview } = useMatches();

  return (
    <section className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-ink">{t("title")}</h2>
          <p className="text-sm text-ink-600">{t("subtitle")}</p>
        </div>
        {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
      </header>

      {loading ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4"
            >
              <Skeleton className="size-12 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-48" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <EmptyState icon={<ChatIcon />} title={t("errorTitle")} description={t("errorBody")} />
      ) : matches.length === 0 ? (
        <EmptyState
          icon={<ChatIcon size={22} />}
          title={t("emptyTitle")}
          description={t("emptyBody")}
          action={
            <Link href="/app/discover" className={buttonVariants({ size: "sm" })}>
              {c("browseMembers")}
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {matches.map((m) => {
            const other = viewerUid ? otherUid(m, viewerUid) : null;
            const name = (other && m.participants[other]?.displayName) || t("aMember");
            const myUnread = viewerUid ? (m.unread[viewerUid] ?? 0) : 0;
            return (
              <li key={m.pairKey}>
                <Link
                  href={`/app/matches/${m.pairKey}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-linear-to-br from-primary-700 to-primary-600 text-primary-50/80">
                    <LockIcon size={20} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-bold text-ink">{name}</span>
                    <span className="truncate text-sm text-ink-600">
                      {m.lastMessagePreview ?? t("noMessages")}
                    </span>
                  </span>
                  {myUnread > 0 ? (
                    <Badge tone="brand" className="tabular-nums">
                      {myUnread}
                    </Badge>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
