import {
  broadcastInputSchema,
  canDispatch,
  canSendBroadcast,
  type BroadcastAudience,
  type BroadcastStatus,
  type Role,
} from "@nisfi/shared";

/**
 * Broadcast Cloud Function cores (master spec Section 6.3, 12). Sending is
 * admin-gated, validated, and idempotent (a broadcast already sending/sent is
 * never re-dispatched). The deployed callable creates the broadcast, fans out
 * per-recipient notifications in batches, then records the delivery summary and
 * an audit event. SDK-free and unit-testable; Admin SDK wiring is deferred
 * (O-001).
 */
export type BroadcastDispatchResult =
  | {
      ok: true;
      audience: BroadcastAudience;
      update: { status: "sending"; targetedCount: number };
    }
  | { ok: false; reason: "notAllowed" | "invalid" | "alreadyDispatched" };

export function evaluateBroadcastDispatch(
  actorRole: Role,
  input: unknown,
  targetedCount: number,
  currentStatus: BroadcastStatus = "draft",
): BroadcastDispatchResult {
  if (!canSendBroadcast(actorRole)) return { ok: false, reason: "notAllowed" };
  if (!canDispatch(currentStatus)) return { ok: false, reason: "alreadyDispatched" };
  const parsed = broadcastInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  return {
    ok: true,
    audience: parsed.data.audience,
    update: { status: "sending", targetedCount },
  };
}

/**
 * Delivery summary once batched sending finishes: `sent` if every recipient
 * succeeded, otherwise `failed` (partial delivery is surfaced, not hidden).
 */
export function summarizeDelivery(
  targetedCount: number,
  sentCount: number,
  failedCount: number,
): { status: Extract<BroadcastStatus, "sent" | "failed">; sentCount: number; failedCount: number } {
  const status = failedCount === 0 && sentCount === targetedCount ? "sent" : "failed";
  return { status, sentCount, failedCount };
}
