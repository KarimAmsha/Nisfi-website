import type { ChatMessage } from "@nisfi/shared";

export interface SendMessageInput {
  matchId: string;
  senderUid: string;
  text: string;
}

/**
 * ChatRepository port (master spec Sections 5.2, F6). Active participants send
 * text messages under `matches/{pairKey}/messages`; a real-time listener streams
 * them. The sender may soft-delete their own message within the window. Match
 * preview/unread and moderation flags are updated server-side (Functions).
 */
export interface ChatRepository {
  /** Subscribe to a match's messages (ascending). Returns an unsubscribe fn. */
  listen(matchId: string, onChange: (messages: ChatMessage[]) => void): () => void;
  send(input: SendMessageInput): Promise<void>;
  softDelete(matchId: string, messageId: string): Promise<void>;
}
