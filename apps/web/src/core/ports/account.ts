import type { AccountStatus } from "@nisfi/shared";

/**
 * AccountRepository port (master spec Sections 6, 7). Reads the owner's account
 * `status` from the `users` document (the rules allow an owner to read their
 * own user doc). Used by the client access gate to route suspended / banned /
 * deleted members to the status screen — real enforcement stays server-side.
 */
export interface AccountRepository {
  getStatus(uid: string): Promise<AccountStatus>;
}
