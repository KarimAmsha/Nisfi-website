/**
 * Chat message domain (master spec Sections F6, 10.5). Messages live under
 * `matches/{pairKey}/messages/{id}`. Active participants create text messages
 * (1–1000 chars) directly (gated by rules); the sender may soft-delete their
 * own within 15 minutes. A Cloud Function re-checks banned words, flags
 * (`moderation.flagged`) for review, and updates the match preview + unread.
 * Typing indicators and read receipts are explicitly out of V1.
 */
export const MESSAGE_TEXT_MIN = 1;
export const MESSAGE_TEXT_MAX = 1000;
/** Soft-delete window for the sender's own message. */
export const MESSAGE_DELETE_WINDOW_MINUTES = 15;

export interface ChatMessage {
  id: string;
  senderUid: string;
  text: string;
  deleted: boolean;
  moderation: { flagged: boolean };
  createdAt: string;
}

/** Valid length for a message body (after trimming trailing control only —
 * inner whitespace is preserved). */
export function isValidMessageText(text: string): boolean {
  const len = text.trim().length;
  return len >= MESSAGE_TEXT_MIN && text.length <= MESSAGE_TEXT_MAX;
}

const MINUTE_MS = 60 * 1000;

/** The sender may soft-delete their own, not-yet-deleted message within the
 * window (master spec F6). */
export function canDeleteMessage(
  message: Pick<ChatMessage, "senderUid" | "deleted" | "createdAt">,
  actorUid: string,
  now: Date = new Date(),
): boolean {
  if (message.senderUid !== actorUid || message.deleted) return false;
  const elapsedMinutes = (now.getTime() - new Date(message.createdAt).getTime()) / MINUTE_MS;
  return elapsedMinutes <= MESSAGE_DELETE_WINDOW_MINUTES;
}

/** Case-insensitive banned-word check (client pre-check; the server re-checks
 * and flags authoritatively). Matches a banned term as a substring after
 * lowercasing both sides. */
export function containsBannedWord(text: string, bannedWords: readonly string[]): boolean {
  const haystack = text.toLowerCase();
  return bannedWords.some((w) => w.trim().length > 0 && haystack.includes(w.toLowerCase()));
}

/** Short preview stored on the match doc for the list (master spec 10.5). */
export function messagePreview(text: string, max = 80): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1)}…`;
}
