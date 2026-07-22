"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_MEMBER_PREFERENCES,
  type Locale,
  type MemberPreferences,
  type NotificationCategory,
  type ProfileVisibility,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { memberSettingsRepository } from "@/infrastructure/firebase/member-settings.repository";
import { profileRepository } from "@/infrastructure/firebase/profile.repository";

export interface UseMemberSettingsResult {
  preferences: MemberPreferences;
  locale: Locale | null;
  visibility: ProfileVisibility;
  loading: boolean;
  preview: boolean;
  toggleNotification: (category: NotificationCategory) => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
  setVisibility: (visibility: ProfileVisibility) => Promise<void>;
  requestExport: () => Promise<void>;
  requestDeletion: () => Promise<void>;
}

export function useMemberSettings(): UseMemberSettingsResult {
  const { configured, user } = useAuth();
  const [preferences, setPreferences] = useState<MemberPreferences>(DEFAULT_MEMBER_PREFERENCES);
  const [locale, setLocaleState] = useState<Locale | null>(null);
  const [visibility, setVisibilityState] = useState<ProfileVisibility>("visible");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!configured) {
      setPreferences(DEFAULT_MEMBER_PREFERENCES);
      setVisibilityState("visible");
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void Promise.all([
      memberSettingsRepository.getSettings(user.uid),
      profileRepository.getOwn(user.uid),
    ])
      .then(([settings, profile]) => {
        setPreferences(settings.preferences);
        setLocaleState(settings.locale);
        if (profile) setVisibilityState(profile.visibility);
      })
      .finally(() => setLoading(false));
  }, [configured, user]);

  const toggleNotification = useCallback(
    async (category: NotificationCategory) => {
      const next: MemberPreferences = {
        notifications: {
          ...preferences.notifications,
          [category]: !preferences.notifications[category],
        },
      };
      setPreferences(next);
      if (configured && user) await memberSettingsRepository.savePreferences(user.uid, next);
    },
    [configured, user, preferences],
  );

  const setLocale = useCallback(
    async (next: Locale) => {
      setLocaleState(next);
      if (configured && user) await memberSettingsRepository.saveLocale(user.uid, next);
    },
    [configured, user],
  );

  const setVisibility = useCallback(
    async (next: ProfileVisibility) => {
      setVisibilityState(next);
      if (configured && user) await profileRepository.saveOwn(user.uid, { visibility: next });
    },
    [configured, user],
  );

  const requestExport = useCallback(async () => {
    if (configured && user) await memberSettingsRepository.requestDataExport(user.uid);
  }, [configured, user]);

  const requestDeletion = useCallback(async () => {
    if (configured && user) await memberSettingsRepository.requestAccountDeletion(user.uid);
  }, [configured, user]);

  return {
    preferences,
    locale,
    visibility,
    loading,
    preview: !configured,
    toggleNotification,
    setLocale,
    setVisibility,
    requestExport,
    requestDeletion,
  };
}
