import type { Match } from "@nisfi/shared";

/**
 * MatchRepository port (master spec Sections 5.2, F6). Matches are created only
 * inside the accepted-request server transaction (CF7); clients read their own
 * matches but never write them.
 */
export interface MatchRepository {
  listMatches(uid: string): Promise<Match[]>;
  getMatch(pairKey: string): Promise<Match | null>;
  /** Close an active match (server transaction, CF `closeMatch`). */
  close(pairKey: string): Promise<void>;
  /** Toggle the viewer's own `photoReveal` flag (CF `setPhotoReveal`). */
  setPhotoReveal(pairKey: string, reveal: boolean): Promise<void>;
  /** Request short-lived signed URLs for the counterparty's originals when they
   * have revealed (CF `getRevealedPhotoUrls`). */
  getRevealedPhotoUrls(pairKey: string): Promise<string[]>;
}
