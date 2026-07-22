"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  matchesAuditFilter,
  toCsv,
  validateExportRequest,
  type AuditFilter,
  type AuditLogEntry,
  type ExportTable,
  type SystemHealth,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { useAdmin } from "@/lib/use-admin";
import { opsRepository } from "@/infrastructure/firebase/ops.repository";
import type { ExportOutput } from "@/core/ports/ops";

const PREVIEW_AUDIT: AuditLogEntry[] = [
  {
    id: "au1",
    actorUid: "uid_mod01",
    actorRole: "moderator",
    action: "reportTransition",
    targetType: "report",
    targetId: "rp1",
    metadata: { from: "open", to: "resolved" },
    createdAt: "2026-03-20T08:15:00.000Z",
  },
  {
    id: "au2",
    actorUid: "uid_admin1",
    actorRole: "admin",
    action: "sanction",
    targetType: "user",
    targetId: "uid_2b7c88",
    metadata: { sanction: "suspend", email: "omar@example.com" },
    createdAt: "2026-03-19T14:02:00.000Z",
  },
  {
    id: "au3",
    actorUid: "uid_super1",
    actorRole: "superAdmin",
    action: "configChange",
    targetType: "appConfig",
    targetId: "flags.signupsEnabled",
    metadata: { before: true, after: false },
    createdAt: "2026-03-18T11:40:00.000Z",
  },
];

const PREVIEW_HEALTH: SystemHealth = {
  environment: "preview",
  release: "0.6.5-dev",
  status: "degraded",
  checks: {
    firestore: { status: "healthy" },
    functions: { status: "degraded", note: "elevated cold-start latency" },
    fcm: { status: "healthy" },
  },
  updatedAt: "2026-03-20T09:00:00.000Z",
};

const PREVIEW_EXPORT_ROWS: Record<ExportTable, Record<string, unknown>[]> = {
  reports: [
    { id: "rp1", targetType: "message", reason: "harassment", status: "resolved", handledBy: "uid_mod01", createdAt: "2026-03-19", resolvedAt: "2026-03-20" },
    { id: "rp2", targetType: "profile", reason: "fake_profile", status: "open", handledBy: "", createdAt: "2026-03-19", resolvedAt: "" },
  ],
  verifications: [
    { id: "vr1", type: "selfieId", status: "pending", createdAt: "2026-03-18" },
    { id: "vr2", type: "selfieId", status: "approved", createdAt: "2026-03-17" },
  ],
  broadcasts: [
    { id: "bc1", audience: "verified", status: "sent", targetedCount: 4, sentCount: 4, failedCount: 0, createdAt: "2026-03-15" },
  ],
};

export interface UseOpsResult {
  audit: AuditLogEntry[];
  auditLoading: boolean;
  filter: AuditFilter;
  setFilter: (next: AuditFilter) => void;
  preview: boolean;
  health: SystemHealth | null;
  exportTable: (table: ExportTable) => Promise<ExportOutput | null>;
}

export function useOps(): UseOpsResult {
  const { configured, user } = useAuth();
  const { role } = useAdmin();
  const [all, setAll] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [filter, setFilter] = useState<AuditFilter>({});
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    if (!configured) {
      setAll(PREVIEW_AUDIT);
      setHealth(PREVIEW_HEALTH);
      setAuditLoading(false);
      return;
    }
    if (!user) {
      setAuditLoading(false);
      return;
    }
    setAuditLoading(true);
    void opsRepository
      .listAudit()
      .then(setAll)
      .finally(() => setAuditLoading(false));
    void opsRepository.getHealth().then(setHealth);
  }, [configured, user]);

  const audit = useMemo(() => all.filter((e) => matchesAuditFilter(e, filter)), [all, filter]);

  const exportTable = useCallback(
    async (table: ExportTable): Promise<ExportOutput | null> => {
      if (configured) return opsRepository.exportTable(table);
      // Preview: validate + build the CSV locally over seeded rows.
      const validation = validateExportRequest(role, table);
      if (!validation.ok) return null;
      const rows = PREVIEW_EXPORT_ROWS[table];
      const capped = rows.slice(0, validation.rowLimit);
      return { columns: validation.columns, csv: toCsv(capped, validation.columns), rowCount: capped.length };
    },
    [configured, role],
  );

  return {
    audit,
    auditLoading,
    filter,
    setFilter,
    preview: !configured,
    health,
    exportTable,
  };
}
