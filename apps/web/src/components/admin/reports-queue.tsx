"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { canApplySanction, SANCTIONS, type Report } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { FlagIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/lib/use-admin";
import { useReportsQueue } from "@/lib/use-reports-queue";

function Detail({
  report,
  onTransition,
  onSanction,
}: {
  report: Report;
  onTransition: (next: "in_review" | "dismissed") => void;
  onSanction: (sanction: (typeof SANCTIONS)[number]) => void;
}) {
  const t = useTranslations("Admin.reports");
  const { role } = useAdmin();

  return (
    <aside className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-bold text-ink">{t("drawerTitle")}</h2>
          <p className="text-xs text-ink-600 tabular-nums">{report.targetUid}</p>
        </div>
        <Badge tone={report.status === "in_review" ? "info" : "pending"} dot>
          {t(`status.${report.status}` as "status.open")}
        </Badge>
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("reason")}</dt>
          <dd className="font-semibold text-ink">
            {t(`reasons.${report.reason}` as "reasons.other")}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("targetType")}</dt>
          <dd className="font-semibold text-ink">
            {t(`targets.${report.targetType}` as "targets.profile")}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("reporter")}</dt>
          <dd className="text-xs text-ink-600 tabular-nums">{report.reporterUid}</dd>
        </div>
      </dl>

      <p className="rounded-md border border-border bg-canvas px-3 py-2.5 text-sm text-ink-600">
        {report.details}
      </p>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-ink-600">{t("triage")}</span>
        <div className="flex flex-wrap gap-2">
          {report.status === "open" ? (
            <Button size="sm" variant="ghost" onClick={() => onTransition("in_review")}>
              {t("startReview")}
            </Button>
          ) : null}
          <Button size="sm" variant="ghost" onClick={() => onTransition("dismissed")}>
            {t("dismiss")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <span className="text-xs font-semibold text-ink-600">{t("sanctions")}</span>
        <div className="flex flex-wrap gap-2">
          {SANCTIONS.filter((s) => s !== "dismiss" && canApplySanction(role, s)).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={s === "ban" || s === "suspend" ? "danger" : "ghost"}
              onClick={() => onSanction(s)}
            >
              {t(`sanction.${s}` as "sanction.warn")}
            </Button>
          ))}
        </div>
        <p className="text-xs text-ink-600">{t("auditNote")}</p>
      </div>
    </aside>
  );
}

export function ReportsQueue() {
  const t = useTranslations("Admin.reports");
  const { queue, loading, error, preview, transition, sanction } = useReportsQueue();
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
            {Array.from({ length: 2 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <EmptyState icon={<FlagIcon />} title={t("errorTitle")} description={t("errorBody")} />
          </div>
        ) : queue.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<FlagIcon size={22} />}
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
                  <span className="grid size-8 place-items-center rounded-md bg-danger/10 text-danger">
                    <FlagIcon size={16} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-ink">
                      {t(`reasons.${r.reason}` as "reasons.other")}
                    </span>
                    <span className="text-xs text-ink-600 tabular-nums">{r.targetUid}</span>
                  </span>
                  <Badge tone={r.status === "in_review" ? "info" : "pending"} dot>
                    {t(`status.${r.status}` as "status.open")}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selected ? (
        <Detail
          report={selected}
          onTransition={(next) => void transition(selected, next)}
          onSanction={(s) => void sanction(selected, s)}
        />
      ) : (
        <aside className="grid place-items-center rounded-lg border border-dashed border-border bg-surface/60 p-8 text-center text-sm text-ink-600">
          {t("selectHint")}
        </aside>
      )}
    </div>
  );
}
