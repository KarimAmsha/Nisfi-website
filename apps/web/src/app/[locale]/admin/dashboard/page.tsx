import { useTranslations } from "next-intl";
import { AdminShell } from "@/components/shell/admin-shell";
import { Card } from "@/components/ui/card";

const TILES = [
  { key: "members", value: "1,240", tone: "text-primary-700" },
  { key: "pendingVerifications", value: "12", tone: "text-warning" },
  { key: "openReports", value: "3", tone: "text-danger" },
  { key: "matches", value: "38", tone: "text-primary-700" },
] as const;

export default function AdminDashboardPage() {
  const t = useTranslations("Admin.dashboard");
  return (
    <AdminShell title={t("title")}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {TILES.map((tile) => (
            <Card key={tile.key} className="p-5">
              <p className="text-sm text-ink-600">{t(tile.key)}</p>
              <p className={`mt-2 text-3xl font-bold tabular-nums ${tile.tone}`}>{tile.value}</p>
            </Card>
          ))}
        </div>
        <p className="text-xs text-ink-600">{t("trendNote")}</p>
      </div>
    </AdminShell>
  );
}
