"use client";

import { useTranslations } from "next-intl";
import { type HealthStatus } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { GaugeIcon } from "@/components/ui/icon";
import { useOps } from "@/lib/use-ops";

function statusTone(status: HealthStatus) {
  if (status === "healthy") return "success" as const;
  if (status === "degraded") return "pending" as const;
  return "danger" as const;
}

export function HealthView() {
  const t = useTranslations("Admin.health");
  const { health, preview } = useOps();

  if (!health) {
    return (
      <EmptyState
        icon={<GaugeIcon size={22} />}
        title={t("emptyTitle")}
        description={t("emptyDesc")}
      />
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-ink">{t("heading")}</h2>
          <Badge tone={statusTone(health.status)} dot>
            {t(`status.${health.status}` as "status.healthy")}
          </Badge>
          {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
        </div>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-ink-600">{t("environment")}</dt>
            <dd className="font-semibold tabular-nums text-ink">{health.environment}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-600">{t("release")}</dt>
            <dd className="font-semibold tabular-nums text-ink">{health.release}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink-600">{t("updatedAt")}</dt>
            <dd className="text-xs tabular-nums text-ink-600">
              {health.updatedAt.replace("T", " ").slice(0, 19)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <span className="text-xs font-semibold text-ink-600">{t("checks")}</span>
          <ul className="flex flex-col gap-2">
            {Object.entries(health.checks).map(([name, check]) => (
              <li key={name} className="flex items-center justify-between gap-3">
                <span className="flex flex-col">
                  <span className="text-sm text-ink">{name}</span>
                  {check.note ? <span className="text-xs text-ink-600">{check.note}</span> : null}
                </span>
                <Badge tone={statusTone(check.status)} dot>
                  {t(`status.${check.status}` as "status.healthy")}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-ink-600">{t("secretsNote")}</p>
      </div>
    </div>
  );
}
