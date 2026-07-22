"use client";

import { useCallback, useEffect, useState } from "react";
import { type Block } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { blockRepository } from "@/infrastructure/firebase/block.repository";
import { PREVIEW_BLOCKED } from "@/lib/notifications-preview";

export interface UseBlockedResult {
  blocked: Block[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  unblock: (targetUid: string) => Promise<void>;
  reload: () => void;
}

export function useBlocked(): UseBlockedResult {
  const { configured, user } = useAuth();
  const [blocked, setBlocked] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setBlocked(PREVIEW_BLOCKED);
      setLoading(false);
      return;
    }
    if (!user) {
      setBlocked([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    blockRepository
      .listBlocked(user.uid)
      .then(setBlocked)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const unblock = useCallback(
    async (targetUid: string) => {
      setBlocked((prev) => prev.filter((b) => b.targetUid !== targetUid));
      if (configured && user) await blockRepository.unblock(targetUid);
    },
    [configured, user],
  );

  return { blocked, loading, error, preview: !configured, unblock, reload: load };
}
