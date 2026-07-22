import { buildAcceptedMatch, type MatchParticipant, type NewMatch } from "@nisfi/shared";
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
