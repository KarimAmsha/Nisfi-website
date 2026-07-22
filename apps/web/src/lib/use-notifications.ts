"use client";

import { useCallback, useEffect, useState } from "react";
import { unreadCount, type AppNotification } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { notificationService } from "@/infrastructure/firebase/notification.service";
import { PREVIEW_NOTIFICATIONS } from "@/lib/notifications-preview";

export interface UseNotificationsResult {
  items: AppNotification[];
  unread: number;
  loading: boolean;
  error: boolean;
  preview: boolean;
  markRead: (id: string) => Promise<void>;
  reload: () => void;
}

export function useNotifications(): UseNotificationsResult {
  const { configured, user } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setItems(PREVIEW_NOTIFICATIONS);
      setLoading(false);
      return;
    }
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    notificationService
      .list(user.uid)
      .then(setItems)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const markRead = useCallback(
    async (id: string) => {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (configured && user) await notificationService.markRead(user.uid, id);
    },
    [configured, user],
  );

  return {
    items,
    unread: unreadCount(items),
    loading,
    error,
    preview: !configured,
    markRead,
    reload: load,
  };
}
