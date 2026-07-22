import type { Block } from "@nisfi/shared";

/**
 * BlockRepository port (master spec Sections 5.2, F6). Block/unblock go through
 * the server (CF10) which atomically creates/removes the block and closes any
 * active match; clients never write `blocks/**` directly. Reads are owner-only.
 */
export interface BlockRepository {
  block(targetUid: string): Promise<void>;
  unblock(targetUid: string): Promise<void>;
  listBlocked(uid: string): Promise<Block[]>;
}
