"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { VerificationRequest } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { LockIcon, ShieldCheckIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useVerificationQueue } from "@/lib/use-verification-queue";

function Detail({
  request,
  onDecide,
}: {
  request: VerificationRequest;
  onDecide: (decision: "approve" | "reject", reason?: string) => void;
}) {
  const t = useTranslations("Admin.verifications");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <aside className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-bold text-ink">{t("drawerTitle")}</h2>
          <p className="text-xs text-ink-600 tabular-nums">{request.uid}</p>
        </div>
        <Badge tone="pending" dot>
          {t("statusPending")}
        </Badge>
      </div>

      {/* Private evidence — staff-only, via short-lived signed URLs (deferred). */}
      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid aspect-video place-items-center bg-linear-to-br from-primary-700 to-primary-600">
          <LockIcon size={34} className="text-primary-50/85" />
        </div>
        <p className="flex items-center gap-2 border-t border-border bg-canvas px-3 py-2 text-xs text-ink-600">
          <LockIcon size={14} />
          {t("evidenceNote")}
        </p>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("colType")}</dt>
          <dd className="font-semibold text-ink">
            {request.type === "selfieId" ? t("typeSelfieId") : t("typeIdOnly")}
          </dd>
        </div>
      </dl>

      <p className="rounded-md border border-border border-s-[3px] border-s-accent bg-canvas px-3 py-2.5 text-xs text-ink-600">
        {t("auditNote")}
      </p>

      {rejecting ? (
        <div className="flex flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder={t("reasonPlaceholder")}
            aria-label={t("reasonPlaceholder")}
            className="w-full resize-none rounded-md border border-border bg-surface p-2.5 text-sm text-ink focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="danger"
              disabled={reason.trim().length === 0}
              onClick={() => onDecide("reject", reason.trim())}
            >
              {t("confirmReject")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <Button size="sm" onClick={() => onDecide("approve")}>
            {t("approve")}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setRejecting(true)}>
            {t("reject")}
          </Button>
        </div>
      )}
    </aside>
  );
}

export function VerificationQueue() {
  const t = useTranslations("Admin.verifications");
  const { queue, loading, error, preview, decide } = useVerificationQueue();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Keep a valid selection as the queue changes (decisions remove items).
  useEffect(() => {
    if (queue.length === 0) setSelectedId(null);
    else if (!queue.some((r) => r.id === selectedId)) setSelectedId(queue[0]?.id ?? null);
  }, [queue, selectedId]);

  const selected = queue.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold text-ink">{t("heading")}</h2>
          <Badge tone="brand" className="tabular-nums">
            {queue.length}
          </Badge>
          {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <EmptyState
              icon={<ShieldCheckIcon />}
              title={t("errorTitle")}
              description={t("errorBody")}
            />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<ShieldCheckIcon size={22} />}
              title={t("emptyTitle")}
              description={t("emptyBody")}
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {queue.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  className={cn(
                    "flex w-full items-center gap-3 px-5 py-3 text-start transition-colors hover:bg-primary-50/50",
                    r.id === selectedId ? "bg-primary-50" : undefined,
                  )}
                >
                  <span className="grid size-8 place-items-center rounded-md bg-primary-700 text-xs font-bold text-white">
                    {r.uid.slice(4, 6).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-xs text-ink-600 tabular-nums">{r.uid}</span>
                    <span className="text-xs text-ink-600">
                      {r.type === "selfieId" ? t("typeSelfieId") : t("typeIdOnly")}
                    </span>
                  </span>
                  <Badge tone="pending" dot>
                    {t("statusPending")}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected ? (
        <Detail request={selected} onDecide={(d, reason) => void decide(selected.id, d, reason)} />
      ) : (
        <aside className="grid place-items-center rounded-lg border border-dashed border-border bg-surface/60 p-8 text-center text-sm text-ink-600">
          {t("selectHint")}
        </aside>
      )}
    </div>
  );
}
