import type { ConnectionRequest } from "@nisfi/shared";

export interface SendRequestInput {
  fromUid: string;
  toUid: string;
  message: string;
}

/** Recipient actions (`accept`/`decline`) — withdraw is a separate sender op. */
export type RespondAction = "accept" | "decline";

/**
 * ConnectionRequestRepository port (master spec Sections 5.2, F5). Sends go
 * through the server (CF6 `sendConnectionRequest`) which atomically enforces
 * eligibility, dedupe, cooldown, and the pending/daily limits — clients never
 * write `connectionRequests` directly. The read helpers back the client-side
 * preflight so the composer can warn before a doomed send; the server remains
 * the authority.
 */
export interface ConnectionRequestRepository {
  send(input: SendRequestInput): Promise<ConnectionRequest>;
  /** The sender's current number of `pending` sent requests. */
  countPendingSent(uid: string): Promise<number>;
  /** The most recent request for a pair, or null — used for dedupe/cooldown. */
  getLatestForPair(pairKey: string): Promise<ConnectionRequest | null>;
  /** Requests where the member is the recipient (Received tab). */
  listReceived(uid: string): Promise<ConnectionRequest[]>;
  /** Requests the member sent (Sent tab). */
  listSent(uid: string): Promise<ConnectionRequest[]>;
  /** Recipient accepts/declines a pending request (server transaction, CF7). */
  respond(id: string, action: RespondAction, reason?: string): Promise<void>;
  /** Sender withdraws their pending request (server transaction, CF7). */
  withdraw(id: string): Promise<void>;
}
