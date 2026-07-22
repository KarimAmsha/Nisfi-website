/**
 * Push-notification domain (master spec Section F9). Web push permission is
 * requested only AFTER a first meaningful action (never on load). FCM tokens
 * are stored as private per-device documents under `users/{uid}/devices/{id}`
 * and pruned by a Function on invalid-token errors. Message push is throttled
 * to at most one per match per 5 minutes. All content is i18n keys + params,
 * rendered in the recipient's locale.
 */
export const PUSH_THROTTLE_MINUTES = 5;

export interface DeviceToken {
  token: string;
  platform: string;
  createdAt: string;
  lastSeenAt: string;
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

const MINUTE_MS = 60 * 1000;

/**
 * Whether a new-message push may be sent for a match given the last push time
 * (throttle: at most one per match per {@link PUSH_THROTTLE_MINUTES} minutes).
 * In-app notifications are always created; only push is throttled.
 */
export function shouldSendMessagePush(
  lastPushAt: string | null,
  now: Date = new Date(),
  throttleMinutes: number = PUSH_THROTTLE_MINUTES,
): boolean {
  if (!lastPushAt) return true;
  const elapsedMinutes = (now.getTime() - new Date(lastPushAt).getTime()) / MINUTE_MS;
  return elapsedMinutes >= throttleMinutes;
}
