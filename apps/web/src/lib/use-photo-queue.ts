"use client";

import { useCallback, useEffect, useState } from "react";
import type { PhotoDecision } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { adminRepository } from "@/infrastructure/firebase/admin.repository";
import type { PhotoQueueItem } from "@/core/ports/admin";

const PREVIEW_QUEUE: PhotoQueueItem[] = [
  { id: "ph1", uid: "uid_9f3a12", order: 0, moderation: "pending", ownerPreviewUrl: null, createdAt: "2026-03-19T18:05:00.000Z" },
  { id: "ph2", uid: "uid_2b7c88", order: 1, moderation: "pending", ownerPreviewUrl: null, createdAt: "2026-03-19T17:45:00.000Z" },
  { id: "ph3", uid: "uid_5d1e04", order: 0, moderation: "pending", ownerPreviewUrl: null, createdAt: "2026-03-19T17:20:00.000Z" },
  { id: "ph4", uid: "uid_7c2a55", order: 2, moderation: "pending", ownerPreviewUrl: null, createdAt: "2026-03-19T17:00:00.000Z" },
];

export interface UsePhotoQueueResult {
  queue: PhotoQueueItem[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  decide: (item: PhotoQueueItem, decision: PhotoDecision, reason?: string) => Promise<void>;
  reload: () => void;
}

export function usePhotoQueue(): UsePhotoQueueResult {
  const { configured, user } = useAuth();
  const [queue, setQueue] = useState<PhotoQueueItem[]>([]);
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
      .listPhotoQueue()
      .then(setQueue)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const decide = useCallback(
    async (item: PhotoQueueItem, decision: PhotoDecision, reason?: string) => {
      setQueue((prev) => prev.filter((p) => !(p.id === item.id && p.uid === item.uid)));
      if (configured) await adminRepository.decidePhoto(item.uid, item.id, decision, reason);
    },
    [configured],
  );

  return { queue, loading, error, preview: !configured, decide, reload: load };
}
