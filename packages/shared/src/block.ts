/**
 * Block domain (master spec Sections F6, 10.6). A block is instant, unilateral,
 * and silent: `blocks/{uid}/blocked/{targetUid}`. Direct client writes are
 * denied — the `blockUser`/`unblockUser` callables (CF10) create/remove it
 * atomically and close any active match (`closedReason: "block"`). Discovery
 * eligibility already excludes blocked members in both directions via the
 * viewer's pre-unioned `blockedUids` set.
 */
export interface Block {
  targetUid: string;
  createdAt: string;
}

export type BlockDecision = { ok: true } | { ok: false; reason: "self" };

/** A member cannot block themselves; every other target is allowed (the
 * callable additionally verifies the target exists). */
export function canBlock(actorUid: string, targetUid: string): BlockDecision {
  if (actorUid === targetUid) return { ok: false, reason: "self" };
  return { ok: true };
}
