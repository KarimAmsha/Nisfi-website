"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdmin } from "@/lib/use-admin";

const HEALTH = ["auth", "database", "functions", "media"] as const;

export function AdminDashboard() {
  const t = useTranslations("Admin.dashboard");
  const { counts, loading, error, preview } = useAdmin();

  const tiles = [
    { key: "pendingVerifications", value: counts.pendingVerifications, tone: "text-warning" },
    { key: "pendingPhotos", value: counts.pendingPhotos, tone: "text-warning" },
    { key: "openReports", value: counts.openReports, tone: "text-danger" },
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-ink-600">{t("queuesTitle")}</h2>
          {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {HEALTH.slice(0, 3).map((k) => (
              <Skeleton key={k} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-5">
            <p className="text-sm text-danger">{t("error")}</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {tiles.map((tile) => (
              <Card key={tile.key} className="p-5">
                <p className="text-sm text-ink-600">{t(tile.key)}</p>
                <p className={`mt-2 text-3xl font-bold tabular-nums ${tile.tone}`}>{tile.value}</p>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-ink-600">{t("healthTitle")}</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {HEALTH.map((area) => (
            <Card key={area} className="flex items-center justify-between gap-2 p-4">
              <span className="text-sm text-ink">{t(`health.${area}` as "health.auth")}</span>
              <Badge tone="pending">{t("pendingWiring")}</Badge>
            </Card>
          ))}
        </div>
        <p className="text-xs text-ink-600">{t("healthNote")}</p>
      </section>
    </div>
  );
}
