"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { LockIcon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { useBlocked } from "@/lib/use-blocked";
import { getPreviewProfile } from "@/lib/discovery-preview";

export function BlockedList() {
  const t = useTranslations("Blocked");
  const { blocked, loading, error, preview, unblock } = useBlocked();

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-5">
      <header className="flex flex-col gap-1">
        <Link
          href="/app/settings"
          className="text-sm font-semibold text-primary-700 hover:underline"
        >
          {t("back")}
        </Link>
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-ink">{t("title")}</h2>
          {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
        </div>
        <p className="text-sm text-ink-600">{t("subtitle")}</p>
      </header>

      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : error ? (
        <EmptyState icon={<LockIcon />} title={t("errorTitle")} description={t("errorBody")} />
      ) : blocked.length === 0 ? (
        <EmptyState
          icon={<LockIcon size={22} />}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {blocked.map((b) => {
            const name = getPreviewProfile(b.targetUid)?.profile.displayName ?? t("aMember");
            return (
              <li
                key={b.targetUid}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4"
              >
                <span className="font-medium text-ink">{name}</span>
                <Button variant="ghost" size="sm" onClick={() => void unblock(b.targetUid)}>
                  {t("unblock")}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
