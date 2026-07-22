import {
  canAccessRevealedPhotos,
  canSetPhotoReveal,
  type RevealAccessDecision,
} from "@nisfi/shared";

/**
 * Photo-reveal Cloud Function cores (master spec Section F7, O-002).
 *
 * `setPhotoReveal` — a participant of an active match flips their own
 * `photoReveal[uid]` flag (match writes are server-only). `getRevealedPhotoUrls`
 * validates membership + the counterparty's reveal flag, then returns
 * short-lived signed Cloudinary URLs for the originals — never public, never
 * cached in Firestore. Revoking the flag denies the next request. SDK-free and
 * unit-testable; Cloudinary signing + Admin SDK wiring are deferred (O-001).
 */

export type SetRevealResult =
  { ok: true; field: string; value: boolean } | { ok: false; reason: "notAllowed" };

export function evaluateSetPhotoReveal(
  match: { uids: readonly string[]; status: string },
  actorUid: string,
  reveal: boolean,
): SetRevealResult {
  if (!canSetPhotoReveal(match, actorUid)) return { ok: false, reason: "notAllowed" };
  return { ok: true, field: `photoReveal.${actorUid}`, value: reveal };
}

/** Authorize a revealed-photo URL request (the callable returns signed URLs only
 * when this is `ok`). */
export function evaluateRevealAccess(
  match: { uids: readonly string[]; photoReveal: Record<string, boolean> },
  viewerUid: string,
): RevealAccessDecision {
  return canAccessRevealedPhotos(match, viewerUid);
}
