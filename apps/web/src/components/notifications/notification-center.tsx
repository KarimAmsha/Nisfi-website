"use client";

import { useTranslations } from "next-intl";
import type { AppNotification } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { BellIcon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { useNotifications } from "@/lib/use-notifications";
import { PushPrompt } from "@/components/notifications/push-prompt";

function Row({ item, onOpen }: { item: AppNotification; onOpen: (item: AppNotification) => void }) {
  const nc = useTranslations("NotificationCatalog");
  const key = (k: string) => nc(k as Parameters<typeof nc>[0], item.params);
  const body = (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          "mt-1 size-2 shrink-0 rounded-full",
          item.read ? "bg-transparent" : "bg-primary",
        )}
        aria-hidden
      />
      <div className="flex flex-col gap-0.5">
        <span className={cn("text-sm", item.read ? "font-medium text-ink" : "font-bold text-ink")}>
          {key(item.titleKey)}
        </span>
        <span className="text-sm text-ink-600">{key(item.bodyKey)}</span>
      </div>
    </div>
  );

  const className = cn(
    "block rounded-lg border p-4 text-start transition-colors",
    item.read ? "border-border bg-surface" : "border-primary/25 bg-primary-50/40",
  );

  return item.link ? (
    <Link href={item.link} onClick={() => onOpen(item)} className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={() => onOpen(item)} className={cn(className, "w-full")}>
      {body}
    </button>
  );
}

export function NotificationCenter() {
  const t = useTranslations("Notifications");
  const { items, unread, loading, error, preview, markRead } = useNotifications();

  return (
    <section className="mx-auto flex max-w-2xl flex-col gap-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-ink">{t("title")}</h2>
          {unread ? (
            <Badge tone="brand" className="tabular-nums">
              {unread}
            </Badge>
          ) : null}
        </div>
        {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
      </header>

      <PushPrompt />

      {loading ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="rounded-lg border border-border bg-surface p-4">
              <Skeleton className="mb-2 h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <EmptyState icon={<BellIcon />} title={t("errorTitle")} description={t("errorBody")} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<BellIcon size={22} />}
          title={t("emptyTitle")}
          description={t("emptyDesc")}
        />
      ) : (
        <>
          {unread ? (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => items.forEach((n) => !n.read && void markRead(n.id))}
              >
                {t("markAllRead")}
              </Button>
            </div>
          ) : null}
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li key={item.id}>
                <Row item={item} onOpen={(n) => void markRead(n.id)} />
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
