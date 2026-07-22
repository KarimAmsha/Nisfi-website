import { shouldSendMessagePush } from "@nisfi/shared";

/**
 * Push Cloud Function cores (master spec Section F9, 12). The message-push
 * trigger calls {@link shouldPushMessage} to honour the per-match 5-minute
 * throttle (in-app notifications are always created; only push is throttled).
 * The token lifecycle prunes device docs when FCM reports the token is invalid;
 * {@link isInvalidTokenError} maps those error codes. SDK-free and
 * unit-testable; the FCM/Admin SDK wiring is deferred (O-001).
 */
export function shouldPushMessage(lastPushAt: string | null, now?: Date): boolean {
  return shouldSendMessagePush(lastPushAt, now);
}

/** FCM error codes that mean the stored token should be deleted. */
export const INVALID_TOKEN_CODES = [
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
  "messaging/invalid-argument",
] as const;

export function isInvalidTokenError(code: string): boolean {
  return (INVALID_TOKEN_CODES as readonly string[]).includes(code);
}
