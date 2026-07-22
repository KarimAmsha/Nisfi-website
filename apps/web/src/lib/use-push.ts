"use client";

import { useCallback, useEffect, useState } from "react";
import type { PushPermission } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { pushService } from "@/infrastructure/firebase/push.service";

const PREVIEW_KEY = "nisfi.pushEnabled";

export interface UsePushResult {
  permission: PushPermission;
  preview: boolean;
  /** Request permission on an explicit user action (never on load). */
  enable: () => Promise<void>;
}

export function usePush(): UsePushResult {
  const { configured, user } = useAuth();
  const [permission, setPermission] = useState<PushPermission>("default");

  useEffect(() => {
    if (!configured) {
      try {
        setPermission(localStorage.getItem(PREVIEW_KEY) === "1" ? "granted" : "default");
      } catch {
        setPermission("default");
      }
      return;
    }
    setPermission(pushService.currentPermission());
  }, [configured]);

  const enable = useCallback(async () => {
    if (!configured) {
      try {
        localStorage.setItem(PREVIEW_KEY, "1");
      } catch {
        /* storage may be unavailable */
      }
      setPermission("granted");
      return;
    }
    if (!user) return;
    setPermission(await pushService.enable(user.uid));
  }, [configured, user]);

  return { permission, preview: !configured, enable };
}
