"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { LockIcon } from "@/components/ui/icon";
import { usePhotoQueue } from "@/lib/use-photo-queue";
import type { PhotoQueueItem } from "@/core/ports/admin";

function Tile({
  item,
  onDecide,
}: {
  item: PhotoQueueItem;
  onDecide: (decision: "approve" | "reject", reason?: string) => void;
}) {
  const t = useTranslations("Admin.photos");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      {/* Blurred/pending placeholder — the real blurred variant is publishable
          only after approval; originals are never staff-cached (O-002). */}
      <div className="relative grid aspect-square place-items-center bg-linear-to-br from-primary-700 to-primary-600">
        <LockIcon size={30} className="text-primary-50/85" />
        <span className="absolute start-2 top-2 rounded-full bg-[rgba(15,30,25,0.6)] px-2 py-0.5 text-[0.65rem] text-white">
          {item.uid}
        </span>
      </div>
      <div className="flex flex-col gap-2 p-3">
        {rejecting ? (
          <>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
              aria-label={t("reasonPlaceholder")}
              className="h-9 rounded-md border border-border bg-surface px-2.5 text-sm text-ink focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="danger"
                block
                disabled={reason.trim().length === 0}
                onClick={() => onDecide("reject", reason.trim())}
              >
                {t("confirmReject")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
                {t("cancel")}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" block onClick={() => onDecide("approve")}>
              {t("approve")}
            </Button>
            <Button size="sm" variant="danger" onClick={() => setRejecting(true)}>
              {t("reject")}
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

export function PhotoQueue() {
  const t = useTranslations("Admin.photos");
  const { queue, loading, error, preview, decide } = usePhotoQueue();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-ink">{t("heading")}</h2>
        <Badge tone="brand" className="tabular-nums">
          {queue.length}
        </Badge>
        {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
      </div>
      <p className="text-xs text-ink-600">{t("note")}</p>

      {loading ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i}>
              <Skeleton className="aspect-square w-full rounded-lg" />
            </li>
          ))}
        </ul>
      ) : error ? (
        <EmptyState icon={<LockIcon />} title={t("errorTitle")} description={t("errorBody")} />
      ) : queue.length === 0 ? (
        <EmptyState
          icon={<LockIcon size={22} />}
          title={t("emptyTitle")}
          description={t("emptyBody")}
        />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {queue.map((item) => (
            <Tile
              key={`${item.uid}-${item.id}`}
              item={item}
              onDecide={(d, reason) => void decide(item, d, reason)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
