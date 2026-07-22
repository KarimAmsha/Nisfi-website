import {
  buildAcceptedMatch,
  canCloseMatch,
  type CloseMatchDecision,
  type MatchParticipant,
  type MatchStatus,
  type NewMatch,
} from "@nisfi/shared";
import { evaluateTransition, type TransitionReadState } from "./connection-requests";

/**
 * CF7 accept → match-creation core (master spec Sections F6, 10.5, 12). When
 * the recipient accepts, the deployed callable — in one transaction — checks
 * the transition, then writes `matches/{pairKey}` and flips the request to
 * `accepted`. Because the doc id is the `pairKey`, a replayed accept is
 * idempotent (same id, `merge` is a no-op on the immutable core). SDK-free and
 * unit-testable; the Admin SDK wiring is deferred (O-001).
 */
export interface AcceptResult {
  ok: boolean;
  matchId?: string;
  match?: NewMatch;
  reason?: string;
}

export function evaluateAccept(
  state: TransitionReadState,
  participants: Record<string, MatchParticipant>,
): AcceptResult {
  const decision = evaluateTransition("accept", state);
  if (!decision.ok) return { ok: false, reason: decision.reason };
  const match = buildAcceptedMatch(
    { id: state.requestId, fromUid: state.fromUid, toUid: state.toUid },
    participants,
  );
  return { ok: true, matchId: match.pairKey, match };
}

/**
 * CF `closeMatch` core (master spec F6). The deployed callable re-reads the
 * match in a transaction, calls this, and on `ok` writes the closed state,
 * keeping message history read-only. A user-initiated close records the actor.
 */
export type CloseResult =
  | { ok: true; update: { status: MatchStatus; closedBy: string; closedReason: "user_closed" } }
  | (CloseMatchDecision & { ok: false });

export function evaluateCloseMatch(
  match: { uids: readonly string[]; status: MatchStatus },
  actorUid: string,
): CloseResult {
  const decision = canCloseMatch(
    { uids: [...match.uids] as [string, string], status: match.status },
    actorUid,
  );
  if (!decision.ok) return decision;
  return {
    ok: true,
    update: { status: "closed", closedBy: actorUid, closedReason: "user_closed" },
  };
}
