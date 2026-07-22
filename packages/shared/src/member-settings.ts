import { z } from "zod";

/**
 * Member settings & preferences (master spec Section 7). Notification
 * preferences and the communication locale live on the owner-writable `users`
 * document (`users.preferences`, `users.locale`) — the security rules already
 * allow the owner to update exactly those fields. Profile visibility is a
 * separate profile field. These helpers validate and merge preferences so the
 * client and any server enforcement agree on shape and defaults.
 */
export const NOTIFICATION_CATEGORIES = [
  "requests",
  "matches",
  "messages",
  "announcements",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export interface MemberPreferences {
  notifications: Record<NotificationCategory, boolean>;
}

/** Everything on by default — a member opts out, never in. */
export const DEFAULT_MEMBER_PREFERENCES: MemberPreferences = {
  notifications: { requests: true, matches: true, messages: true, announcements: true },
};

export const memberPreferencesSchema = z.object({
  notifications: z.object({
    requests: z.boolean(),
    matches: z.boolean(),
    messages: z.boolean(),
    announcements: z.boolean(),
  }),
});

/**
 * Merge a stored (possibly partial or absent) preferences object over the
 * defaults, so a missing category reads its default rather than `undefined`.
 */
export function mergeMemberPreferences(stored: unknown): MemberPreferences {
  const source =
    stored !== null && typeof stored === "object" && "notifications" in stored
      ? ((stored as { notifications?: Partial<Record<NotificationCategory, unknown>> })
          .notifications ?? {})
      : {};
  const notifications = { ...DEFAULT_MEMBER_PREFERENCES.notifications };
  for (const category of NOTIFICATION_CATEGORIES) {
    const value = source[category];
    if (typeof value === "boolean") notifications[category] = value;
  }
  return { notifications };
}

/** Whether a member wants notifications for a category (default true). */
export function notificationEnabled(
  preferences: MemberPreferences,
  category: NotificationCategory,
): boolean {
  return preferences.notifications[category];
}
