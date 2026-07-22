/**
 * In-app notification domain (master spec Sections F6, 10.8). Notifications are
 * created ONLY by Cloud Functions; the owner may read them and flip `read`.
 * `titleKey`/`bodyKey` are i18n keys resolved on the client with `params`, so
 * copy stays localized and server-agnostic.
 */
export const NOTIFICATION_TYPES = [
  "requestReceived",
  "requestAccepted",
  "requestDeclined",
  "requestWithdrawn",
  "verificationApproved",
  "verificationRejected",
  "matchClosed",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface AppNotification {
  id: string;
  /** One of {@link NOTIFICATION_TYPES}; typed as string for forward-compat with
   * server-added types. */
  type: string;
  titleKey: string;
  bodyKey: string;
  params: Record<string, string>;
  link: string | null;
  read: boolean;
  createdAt: string;
}

/** Count of unread notifications, for the shell badge. */
export function unreadCount(notifications: readonly AppNotification[]): number {
  return notifications.reduce((n, item) => (item.read ? n : n + 1), 0);
}
