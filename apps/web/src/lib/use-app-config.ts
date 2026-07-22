"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_APP_CONFIG,
  validateConfigChange,
  type AppConfig,
  type ConfigChange,
  type ConfigFlag,
  type ConfigLimitKey,
  type ContentBlockKey,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { configRepository } from "@/infrastructure/firebase/config.repository";

// Preview seed with an announcement filled so the content editor shows content.
const PREVIEW_CONFIG: AppConfig = {
  flags: { ...DEFAULT_APP_CONFIG.flags, chatEnabled: true },
  limits: { ...DEFAULT_APP_CONFIG.limits },
  content: {
    ...DEFAULT_APP_CONFIG.content,
    announcement: {
      ar: "الصيانة الليلة 12–1 صباحًا بتوقيت مكة.",
      en: "Maintenance tonight 12–1am (Mecca time).",
      tr: "Bakım bu gece 24:00–01:00 (Mekke saati).",
    },
  },
};

/** Apply a validated change to a local config copy (optimistic mirror of the
 * server write). Unknown/invalid changes are ignored by validation upstream. */
function applyChange(config: AppConfig, change: ConfigChange): AppConfig {
  if (change.kind === "flag") {
    return { ...config, flags: { ...config.flags, [change.key as ConfigFlag]: change.value } };
  }
  if (change.kind === "limit") {
    return { ...config, limits: { ...config.limits, [change.key as ConfigLimitKey]: change.value } };
  }
  return {
    ...config,
    content: { ...config.content, [change.key as ContentBlockKey]: change.value },
  };
}

export interface UseAppConfigResult {
  config: AppConfig;
  loading: boolean;
  error: boolean;
  preview: boolean;
  update: (change: ConfigChange) => Promise<boolean>;
  reload: () => void;
}

export function useAppConfig(): UseAppConfigResult {
  const { configured, user } = useAuth();
  const [config, setConfig] = useState<AppConfig>(PREVIEW_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setConfig(PREVIEW_CONFIG);
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    configRepository
      .getConfig()
      .then(setConfig)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  // Returns whether the change was valid (client preflight mirrors the server).
  const update = useCallback(
    async (change: ConfigChange) => {
      if (!validateConfigChange(change).ok) return false;
      setConfig((prev) => applyChange(prev, change));
      if (configured) await configRepository.updateConfig(change);
      return true;
    },
    [configured],
  );

  return { config, loading, error, preview: !configured, update, reload: load };
}
