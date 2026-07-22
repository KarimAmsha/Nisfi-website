"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EXPORTABLE_TABLES, EXPORT_ROW_LIMIT, type ExportTable } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { useOps } from "@/lib/use-ops";

const TABLE_KEYS = Object.keys(EXPORTABLE_TABLES) as ExportTable[];

export function ExportsAdmin() {
  const t = useTranslations("Admin.exports");
  const { exportTable, preview } = useOps();
  const [table, setTable] = useState<ExportTable>(TABLE_KEYS[0] ?? "reports");
  const [phase, setPhase] = useState<"idle" | "running" | "done" | "error">("idle");
  const [rowCount, setRowCount] = useState(0);

  const spec = EXPORTABLE_TABLES[table];

  async function run() {
    setPhase("running");
    try {
      const output = await exportTable(table);
      if (!output) {
        setPhase("error");
        return;
      }
      // Trigger a client download of the returned CSV.
      const blob = new Blob([output.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nisfi-${table}-export.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setRowCount(output.rowCount);
      setPhase("done");
    } catch {
      setPhase("error");
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-ink">{t("heading")}</h2>
          {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
        </div>

        <SelectField
          label={t("table")}
          value={table}
          onChange={(e) => {
            setTable(e.target.value as ExportTable);
            setPhase("idle");
          }}
          options={TABLE_KEYS.map((k) => ({
            value: k,
            label: t(`tables.${k}` as "tables.reports"),
          }))}
        />

        <div className="flex flex-col gap-2 rounded-md border border-border bg-canvas p-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-ink-600">{t("includedColumns")}</span>
            <span className="text-xs tabular-nums text-ink">
              {spec.columns
                .filter((c) => !(spec.excluded as readonly string[]).includes(c))
                .join(", ")}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-ink-600">{t("excludedColumns")}</span>
            <span className="text-xs tabular-nums text-danger">{spec.excluded.join(", ")}</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-ink-600">{t("rowLimit")}</span>
            <span className="text-xs tabular-nums text-ink">{EXPORT_ROW_LIMIT}</span>
          </div>
        </div>

        {phase === "done" ? (
          <p className="rounded-md border border-success/25 bg-success/10 px-3 py-2.5 text-sm text-success">
            {t("doneNote", { count: rowCount })}
          </p>
        ) : null}
        {phase === "error" ? (
          <p className="rounded-md border border-danger/25 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            {t("errorNote")}
          </p>
        ) : null}

        <div>
          <Button size="sm" loading={phase === "running"} onClick={() => void run()}>
            {t("exportCsv")}
          </Button>
        </div>
        <p className="text-xs text-ink-600">{t("privacyNote")}</p>
      </div>
    </div>
  );
}
