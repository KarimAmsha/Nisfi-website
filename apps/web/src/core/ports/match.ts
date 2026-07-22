import type { Match } from "@nisfi/shared";

/**
 * MatchRepository port (master spec Sections 5.2, F6). Matches are created only
 * inside the accepted-request server transaction (CF7); clients read their own
 * matches but never write them.
 */
export interface MatchRepository {
  listMatches(uid: string): Promise<Match[]>;
  getMatch(pairKey: string): Promise<Match | null>;
}
