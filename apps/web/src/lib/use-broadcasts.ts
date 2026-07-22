"use client";

import { useCallback, useEffect, useState } from "react";
import {
  estimateAudience,
  type AudienceMember,
  type Broadcast,
  type BroadcastAudience,
  type BroadcastInput,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { broadcastRepository } from "@/infrastructure/firebase/broadcast.repository";

// Seeded audience so the dry-run count is meaningful in preview.
const PREVIEW_AUDIENCE: AudienceMember[] = [
  { uid: "1", status: "active", verified: true, gender: "female" },
  { uid: "2", status: "active", verified: true, gender: "male" },
  { uid: "3", status: "active", verified: true, gender: "female" },
  { uid: "4", status: "active", verified: false, gender: "male" },
  { uid: "5", status: "active", verified: false, gender: "female" },
  { uid: "6", status: "active", verified: true, gender: "male" },
  { uid: "7", status: "suspended", verified: true, gender: "male" },
];

const PREVIEW_BROADCASTS: Broadcast[] = [
  {
    id: "bc1",
    audience: "verified",
    title: { ar: "تحديث الخصوصية", en: "Privacy update", tr: "Gizlilik güncellemesi" },
    body: { ar: "حدّثنا سياسة الخصوصية.", en: "We updated our privacy policy.", tr: "Gizlilik politikamızı güncelledik." },
    status: "sent",
    targetedCount: 4,
    sentCount: 4,
    failedCount: 0,
    createdBy: "admin",
    createdAt: "2026-03-15T10:00:00.000Z",
    sentAt: "2026-03-15T10:01:00.000Z",
  },
  {
    id: "bc2",
    audience: "all",
    title: { ar: "ميزة جديدة", en: "New feature", tr: "Yeni özellik" },
    body: { ar: "جرّب الاستكشاف المحسّن.", en: "Try improved discovery.", tr: "Geliştirilmiş keşfi deneyin." },
    status: "failed",
    targetedCount: 6,
    sentCount: 5,
    failedCount: 1,
    createdBy: "admin",
    createdAt: "2026-03-10T09:00:00.000Z",
    sentAt: "2026-03-10T09:02:00.000Z",
  },
];

export interface UseBroadcastsResult {
  broadcasts: Broadcast[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  estimate: (audience: BroadcastAudience) => Promise<number>;
  send: (input: BroadcastInput) => Promise<void>;
  reload: () => void;
}

export function useBroadcasts(): UseBroadcastsResult {
  const { configured, user } = useAuth();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setBroadcasts(PREVIEW_BROADCASTS);
      setLoading(false);
      return;
    }
    if (!user) {
      setBroadcasts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    broadcastRepository
      .listBroadcasts()
      .then(setBroadcasts)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const estimate = useCallback(
    async (audience: BroadcastAudience) => {
      if (!configured) return estimateAudience(PREVIEW_AUDIENCE, audience);
      return broadcastRepository.estimateAudience(audience);
    },
    [configured],
  );

  const send = useCallback(
    async (input: BroadcastInput) => {
      // Optimistically prepend a "sending" row so the history reflects the action.
      const optimistic: Broadcast = {
        id: `bc_${Date.now()}`,
        audience: input.audience,
        title: input.title,
        body: input.body,
        status: "sending",
        targetedCount: await estimate(input.audience),
        sentCount: 0,
        failedCount: 0,
        createdBy: user?.uid ?? "preview",
        createdAt: new Date().toISOString(),
        sentAt: null,
      };
      setBroadcasts((prev) => [optimistic, ...prev]);
      if (configured) await broadcastRepository.sendBroadcast(input);
    },
    [configured, estimate, user],
  );

  return { broadcasts, loading, error, preview: !configured, estimate, send, reload: load };
}
