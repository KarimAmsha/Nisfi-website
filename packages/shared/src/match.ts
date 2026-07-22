import { makePairKey, type ConnectionRequest } from "./connection-request";

/**
 * Match domain (master spec Sections F6, 10.5). A match is created ONLY inside
 * the accepted-request server transaction (CF7); clients can never create
 * matches. The match id is the `pairKey`, which makes creation idempotent — a
 * ret/replayed accept writes the same document id.
 */
export const MATCH_STATUSES = ["active", "closed"] as const;
export type MatchStatus = (typeof MATCH_STATUSES)[number];

export type MatchCloseReason = "user_closed" | "block" | "deletion" | "sanction";

export interface MatchParticipant {
  displayName: string;
  primaryBlurredPath: string | null;
}

export interface Match {
  pairKey: string;
  uids: [string, string];
  participants: Record<string, MatchParticipant>;
  status: MatchStatus;
  /** A uid, the literal "system", or null. */
  closedBy: string | null;
  closedReason: MatchCloseReason | null;
  photoReveal: Record<string, boolean>;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unread: Record<string, number>;
  requestId: string;
  createdAt: string;
}

/** The counterparty's uid for a viewer, or null if the viewer isn't a member. */
export function otherUid(match: Pick<Match, "uids">, viewerUid: string): string | null {
  if (!match.uids.includes(viewerUid)) return null;
  return match.uids.find((u) => u !== viewerUid) ?? null;
}

/** Whether a uid is one of the two match participants. */
export function isParticipant(match: Pick<Match, "uids">, uid: string): boolean {
  return match.uids.includes(uid);
}

/** The match document the CF7 accept transaction writes for a request. `uids`
 * are sorted and the id is the `pairKey`, so replays are idempotent. Server sets
 * `createdAt`; counters and reveal flags start clean. */
export type NewMatch = Omit<Match, "createdAt">;

export function buildAcceptedMatch(
  request: Pick<ConnectionRequest, "fromUid" | "toUid" | "id">,
  participants: Record<string, MatchParticipant>,
): NewMatch {
  const uids = [request.fromUid, request.toUid].sort() as [string, string];
  const pairKey = makePairKey(request.fromUid, request.toUid);
  return {
    pairKey,
    uids,
    participants,
    status: "active",
    closedBy: null,
    closedReason: null,
    photoReveal: { [uids[0]]: false, [uids[1]]: false },
    lastMessageAt: null,
    lastMessagePreview: null,
    unread: { [uids[0]]: 0, [uids[1]]: 0 },
    requestId: request.id,
  };
}
