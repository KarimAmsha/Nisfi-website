"use client";

import { useCallback, useEffect, useState } from "react";
import type { VerificationDecision, VerificationRequest } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { adminRepository } from "@/infrastructure/firebase/admin.repository";

const PREVIEW_QUEUE: VerificationRequest[] = [
  { id: "vr1", uid: "uid_9f3a12", type: "selfieId", status: "pending", reason: null, createdAt: "2026-03-19T18:00:00.000Z" },
  { id: "vr2", uid: "uid_2b7c88", type: "selfieId", status: "pending", reason: null, createdAt: "2026-03-19T17:40:00.000Z" },
  { id: "vr3", uid: "uid_5d1e04", type: "idOnly", status: "pending", reason: null, createdAt: "2026-03-19T17:10:00.000Z" },
];

export interface UseVerificationQueueResult {
  queue: VerificationRequest[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  decide: (id: string, decision: VerificationDecision, reason?: string) => Promise<void>;
  reload: () => void;
}

export function useVerificationQueue(): UseVerificationQueueResult {
  const { configured, user } = useAuth();
  const [queue, setQueue] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setQueue(PREVIEW_QUEUE);
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
      .listVerificationQueue()
      .then(setQueue)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const decide = useCallback(
    async (id: string, decision: VerificationDecision, reason?: string) => {
      setQueue((prev) => prev.filter((r) => r.id !== id));
      if (configured) await adminRepository.decideVerification(id, decision, reason);
    },
    [configured],
  );

  return { queue, loading, error, preview: !configured, decide, reload: load };
}
