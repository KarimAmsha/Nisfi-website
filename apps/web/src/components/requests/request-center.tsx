"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ConnectionRequest, ConnectionRequestStatus, RequestAction } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { InboxIcon } from "@/components/ui/icon";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { useRequests } from "@/lib/use-requests";
import { getPreviewProfile } from "@/lib/discovery-preview";

type Tab = "received" | "sent";

const STATUS_TONE: Record<
  ConnectionRequestStatus,
  "pending" | "success" | "neutral" | "danger" | "info"
> = {
  pending: "pending",
  accepted: "success",
  declined: "danger",
  withdrawn: "neutral",
  expired: "neutral",
};

function counterpartyName(uid: string, fallback: string): string {
  return getPreviewProfile(uid)?.profile.displayName ?? fallback;
}

function RequestRow({
  request,
  tab,
  onAct,
}: {
  request: ConnectionRequest;
  tab: Tab;
  onAct: (r: ConnectionRequest, a: RequestAction) => void;
}) {
  const t = useTranslations("Requests");
  const otherUid = tab === "received" ? request.fromUid : request.toUid;
  const name = counterpartyName(otherUid, t("aMember"));
  const isPending = request.status === "pending";

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-ink">{name}</span>
        <Badge tone={STATUS_TONE[request.status]}>{t(`status.${request.status}`)}</Badge>
      </div>
      <p className="text-sm leading-relaxed text-ink-600">{request.message}</p>
      {isPending ? (
        <div className="flex gap-2">
          {tab === "received" ? (
            <>
              <Button size="sm" onClick={() => onAct(request, "accept")}>
                {t("accept")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onAct(request, "decline")}>
                {t("decline")}
              </Button>
            </>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => onAct(request, "withdraw")}>
              {t("withdraw")}
            </Button>
          )}
        </div>
      ) : null}
    </li>
  );
}

export function RequestCenter() {
  const t = useTranslations("Requests");
  const c = useTranslations("Common");
  const [tab, setTab] = useState<Tab>("received");
  const { received, sent, loading, error, preview, act } = useRequests();

  const list = tab === "received" ? received : sent;

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-ink">{t("title")}</h2>
        <p className="text-sm text-ink-600">{t("subtitle")}</p>
      </header>

      <div className="flex items-center gap-2" role="tablist" aria-label={t("title")}>
        {(["received", "sent"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              tab === key
                ? "bg-primary-50 text-primary-700"
                : "text-ink-600 hover:bg-primary-50/60",
            )}
          >
            {t(key === "received" ? "receivedTab" : "sentTab")}
          </button>
        ))}
        {preview ? (
          <Badge tone="info" className="ms-auto">
            {t("previewNote")}
          </Badge>
        ) : null}
      </div>

      {loading ? (
        <ul className="flex flex-col gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <li key={i} className="rounded-lg border border-border bg-surface p-4">
              <Skeleton className="mb-2 h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <EmptyState icon={<InboxIcon />} title={t("errorTitle")} description={t("errorBody")} />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<InboxIcon size={22} />}
          title={tab === "received" ? t("emptyReceivedTitle") : t("emptySentTitle")}
          description={tab === "received" ? t("emptyReceivedBody") : t("emptySentBody")}
          action={
            <Link href="/app/discover" className={buttonVariants({ size: "sm" })}>
              {c("browseMembers")}
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((request) => (
            <RequestRow
              key={request.id}
              request={request}
              tab={tab}
              onAct={(r, a) => void act(r, a)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
