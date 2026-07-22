import { containsBannedWord, messagePreview } from "@nisfi/shared";

/**
 * Chat message onCreate core (master spec Sections F6, 12). The deployed
 * `onMessageCreate` trigger runs this: it re-checks banned words and sets
 * `moderation.flagged` authoritatively (flagged messages still deliver in V1
 * unless the author is sanctioned), and computes the match preview + the
 * recipient's unread increment. SDK-free and unit-testable; the Admin SDK
 * wiring is deferred to the production step (O-001).
 */
export interface MessageModeration {
  flagged: boolean;
}

export function evaluateMessageModeration(
  text: string,
  bannedWords: readonly string[],
): MessageModeration {
  return { flagged: containsBannedWord(text, bannedWords) };
}

export interface MatchUpdateOnMessage {
  lastMessagePreview: string;
  /** The participant whose unread count should increment (the non-sender). */
  recipientUid: string | null;
}

export function buildMatchUpdateOnMessage(
  text: string,
  senderUid: string,
  uids: readonly string[],
): MatchUpdateOnMessage {
  return {
    lastMessagePreview: messagePreview(text),
    recipientUid: uids.find((u) => u !== senderUid) ?? null,
  };
}
