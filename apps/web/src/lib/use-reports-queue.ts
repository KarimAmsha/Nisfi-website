"use client";

import { useCallback, useEffect, useState } from "react";
import type { Report, ReportStatus, Sanction } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { adminRepository } from "@/infrastructure/firebase/admin.repository";

const PREVIEW_REPORTS: Report[] = [
  {
    id: "rp1",
    reporterUid: "uid_2b7c88",
    targetUid: "uid_9f3a12",
    targetType: "message",
    reason: "harassment",
    details: "رسائل متكرّرة غير لائقة بعد رفض الطلب.",
    status: "open",
    handledBy: null,
    resolutionNote: null,
    createdAt: "2026-03-19T18:10:00.000Z",
    resolvedAt: null,
  },
  {
    id: "rp2",
    reporterUid: "uid_5d1e04",
    targetUid: "uid_7c2a55",
    targetType: "profile",
    reason: "fake_profile",
    details: "الصور تبدو مأخوذة من حساب آخر.",
    status: "open",
    handledBy: null,
    resolutionNote: null,
    createdAt: "2026-03-19T16:30:00.000Z",
    resolvedAt: null,
  },
];

export interface UseReportsQueueResult {
  queue: Report[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  transition: (report: Report, next: ReportStatus) => Promise<void>;
  sanction: (report: Report, sanction: Sanction, note?: string) => Promise<void>;
  reload: () => void;
}

export function useReportsQueue(): UseReportsQueueResult {
  const { configured, user } = useAuth();
  const [queue, setQueue] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setQueue(PREVIEW_REPORTS);
      setLoading(false);
      return;
    }
    if (!user) {
      setQueue([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    adminRepository
      .listReports("open")
      .then(setQueue)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const removeFromOpen = (id: string, terminal: boolean) =>
    setQueue((prev) => (terminal ? prev.filter((r) => r.id !== id) : prev));

  const transition = useCallback(
    async (report: Report, next: ReportStatus) => {
      const terminal = next === "resolved" || next === "dismissed";
      if (terminal) removeFromOpen(report.id, true);
      else setQueue((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: next } : r)));
      if (configured) await adminRepository.transitionReport(report.id, next);
    },
    [configured],
  );

  const sanction = useCallback(
    async (report: Report, s: Sanction, note?: string) => {
      // A sanction resolves the case.
      removeFromOpen(report.id, true);
      if (configured) {
        await adminRepository.applySanction(report.targetUid, s, note);
        await adminRepository.transitionReport(report.id, "resolved");
      }
    },
    [configured],
  );

  return { queue, loading, error, preview: !configured, transition, sanction, reload: load };
}
