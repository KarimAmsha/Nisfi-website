import {
  canDecidePhoto,
  photoModerationOutcome,
  type PhotoDecision,
  type PhotoDecisionCheck,
  type PhotoModeration,
} from "@nisfi/shared";

/**
 * CF `decidePhoto` core (master spec Section F8, O-002). A staff member
 * approves/rejects a pending photo; the deployed callable runs this in a
 * transaction, writes the photo's moderation state, and — only on approve —
 * makes the blurred variant publicly readable per the storage rules (a rejected
 * photo is never published). Server-only + audited. SDK-free and unit-testable;
 * Cloudinary/Admin SDK wiring is deferred (O-001/O-002).
 */
export type DecidePhotoResult =
  | {
      ok: true;
      moderation: PhotoModeration;
      reason: string | null;
      decidedBy: string;
      publishBlurred: boolean;
    }
  | (PhotoDecisionCheck & { ok: false });

export function evaluatePhotoDecision(
  photo: { moderation: PhotoModeration },
  actor: { uid: string; isStaff: boolean },
  decision: PhotoDecision,
  reason?: string,
): DecidePhotoResult {
  const check = canDecidePhoto(photo, actor.isStaff);
  if (!check.ok) return check;
  const moderation = photoModerationOutcome(decision);
  return {
    ok: true,
    moderation,
    reason: decision === "reject" ? (reason ?? null) : null,
    decidedBy: actor.uid,
    publishBlurred: moderation === "approved",
  };
}
