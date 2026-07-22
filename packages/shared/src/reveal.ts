import { otherUid } from "./match";

/** The reveal-relevant projection of a match (loosened so pure helpers accept
 * any structural match, not only the full `Match`). */
type RevealView = { uids: readonly string[]; photoReveal: Record<string, boolean> };

/**
 * Photo-reveal domain (master spec Section F7). Each side independently toggles
 * "reveal my photos to this person" (`matches.photoReveal[uid]`, revocable).
 * All UI renders the blurred variant by default; originals are fetched only via
 * the `getRevealedPhotoUrls` callable, which returns short-lived signed URLs and
 * NEVER exposes originals publicly or caches them in Firestore. The reveal flag
 * is set through a callable (match writes are server-only).
 */

/** Whether the viewer is currently revealing *their* photos to the counterparty. */
export function isRevealingOwn(
  match: { photoReveal: Record<string, boolean> },
  viewerUid: string,
): boolean {
  return match.photoReveal[viewerUid] === true;
}

/** Whether the counterparty has revealed *their* photos to the viewer. */
export function counterpartyRevealed(match: RevealView, viewerUid: string): boolean {
  const other = otherUid(match, viewerUid);
  return other !== null && match.photoReveal[other] === true;
}

export type RevealAccessDecision =
  { ok: true } | { ok: false; reason: "notParticipant" | "notRevealed" };

/**
 * The authority the `getRevealedPhotoUrls` callable enforces: the viewer must be
 * a match participant AND the counterparty's reveal flag must be true. Revoking
 * the flag immediately denies access on the next request (URLs are short-lived,
 * never cached).
 */
export function canAccessRevealedPhotos(
  match: RevealView,
  viewerUid: string,
): RevealAccessDecision {
  if (otherUid(match, viewerUid) === null) return { ok: false, reason: "notParticipant" };
  if (!counterpartyRevealed(match, viewerUid)) return { ok: false, reason: "notRevealed" };
  return { ok: true };
}

/** A participant of an active match may toggle their own reveal flag. */
export function canSetPhotoReveal(
  match: { uids: readonly string[]; status: string },
  actorUid: string,
): boolean {
  return match.uids.includes(actorUid) && match.status === "active";
}
