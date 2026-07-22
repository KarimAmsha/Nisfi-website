import { canBlock, type BlockDecision } from "@nisfi/shared";

/**
 * CF10 `blockUser` enforcement core (master spec Section 12, F6). The deployed
 * callable re-checks the actor and target inside a transaction, calls this,
 * and on `ok` atomically writes `blocks/{actor}/blocked/{target}` and closes
 * any active match (`closedReason: "block"`). SDK-free and unit-testable; the
 * `firebase-admin` wiring is deferred to the production step (O-001).
 */
export function evaluateBlock(actorUid: string, targetUid: string): BlockDecision {
  return canBlock(actorUid, targetUid);
}
