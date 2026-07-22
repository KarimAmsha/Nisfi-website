import type { Broadcast, BroadcastAudience, BroadcastInput } from "@nisfi/shared";

/**
 * BroadcastRepository port (master spec Section 6.3, F10). The admin console
 * reads past broadcasts, dry-runs an audience count before sending, and sends
 * through a server-side Cloud Function that validates, fans out per-recipient
 * notifications idempotently, and records the delivery summary + audit. Clients
 * never write `broadcasts` directly.
 */
export interface BroadcastRepository {
  /** Recent broadcasts, newest first (admin read). */
  listBroadcasts(): Promise<Broadcast[]>;
  /** Dry run: how many members would receive a broadcast to this audience. */
  estimateAudience(audience: BroadcastAudience): Promise<number>;
  /** Compose + dispatch a broadcast (validated, idempotent, audited server-side). */
  sendBroadcast(input: BroadcastInput): Promise<void>;
}
