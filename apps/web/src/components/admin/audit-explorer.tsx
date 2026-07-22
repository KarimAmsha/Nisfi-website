"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AUDIT_ACTIONS,
  redactAuditMetadata,
  type AuditFilter,
  type AuditLogEntry,
} from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { GaugeIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useOps } from "@/lib/use-ops";

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

function Detail({ entry }: { entry: AuditLogEntry }) {
  const t = useTranslations("Admin.audit");
  const redacted = redactAuditMetadata(entry.metadata);
  return (
    <aside className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
      <div>
        <h2 className="font-bold text-ink">{entry.action}</h2>
        <p className="text-xs text-ink-600 tabular-nums">
          {entry.createdAt.replace("T", " ").slice(0, 19)}
        </p>
      </div>
      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("actor")}</dt>
          <dd className="text-xs tabular-nums text-ink">
            {entry.actorUid} · {entry.actorRole}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-600">{t("target")}</dt>
          <dd className="text-xs tabular-nums text-ink">
            {entry.targetType} · {entry.targetId}
          </dd>
        </div>
      </dl>
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <span className="text-xs font-semibold text-ink-600">{t("metadata")}</span>
        <dl className="flex flex-col gap-1 rounded-md border border-border bg-canvas p-3 text-xs">
          {Object.entries(redacted).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3">
              <dt className="text-ink-600">{k}</dt>
              <dd className="tabular-nums text-ink">{formatValue(v)}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-ink-600">{t("redactNote")}</p>
      </div>
    </aside>
  );
}

export function AuditExplorer() {
  const t = useTranslations("Admin.audit");
  const { audit, auditLoading, filter, setFilter, preview } = useOps();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (audit.length === 0) setSelectedId(null);
    else if (!audit.some((e) => e.id === selectedId)) setSelectedId(audit[0]?.id ?? null);
  }, [audit, selectedId]);

  const selected = audit.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          label={t("action")}
          value={filter.action ?? ""}
          onChange={(e) => {
            const next: AuditFilter = { ...filter };
            if (e.target.value === "") delete next.action;
            else next.action = e.target.value;
            setFilter(next);
          }}
          placeholder={t("allActions")}
          options={AUDIT_ACTIONS.map((a) => ({ value: a, label: a }))}
        />
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{t("actor")}</span>
          <input
            value={filter.actorUid ?? ""}
            onChange={(e) => {
              const next: AuditFilter = { ...filter };
              if (e.target.value === "") delete next.actorUid;
              else next.actorUid = e.target.value;
              setFilter(next);
            }}
            placeholder={t("actorPlaceholder")}
            aria-label={t("actor")}
            className={cn(
              "h-11 rounded-md border border-border bg-surface px-3 text-sm text-ink tabular-nums",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <h2 className="text-sm font-bold text-ink">{t("heading")}</h2>
            <Badge tone="brand" className="tabular-nums">
              {audit.length}
            </Badge>
            {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
          </div>
          {auditLoading ? (
            <div className="flex flex-col gap-3 p-5">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : audit.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<GaugeIcon size={22} />}
                title={t("emptyTitle")}
                description={t("emptyDesc")}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {audit.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(e.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-5 py-3 text-start transition-colors hover:bg-primary-50/50",
                      e.id === selectedId ? "bg-primary-50" : undefined,
                    )}
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-medium text-ink">{e.action}</span>
                      <span className="text-xs text-ink-600 tabular-nums">
                        {e.targetType} · {e.targetId}
                      </span>
                    </span>
                    <Badge tone="neutral">{e.actorRole}</Badge>
                    <span className="text-xs text-ink-600 tabular-nums">
                      {e.createdAt.slice(0, 10)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selected ? (
          <Detail entry={selected} />
        ) : (
          <aside className="grid place-items-center rounded-lg border border-dashed border-border bg-surface/60 p-8 text-center text-sm text-ink-600">
            {t("selectHint")}
          </aside>
        )}
      </div>
    </div>
  );
}
