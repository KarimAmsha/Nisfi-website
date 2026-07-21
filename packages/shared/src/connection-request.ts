import { z } from "zod";

/**
 * Connection-request domain (master spec Sections F5, 10.4). Contact is a
 * written request, never a swipe. Requests are created and transitioned ONLY by
 * Cloud Functions (CF6 `sendConnectionRequest`, CF7 respond/withdraw) inside a
 * transaction — clients never write `connectionRequests` directly. The send
 * decision below is the exact rule CF6 enforces; sharing it keeps the client
 * preflight and the server authority identical.
 */
export const CONNECTION_REQUEST_STATUSES = [
  "pending",
  "accepted",
  "declined",
  "withdrawn",
  "expired",
] as const;
export type ConnectionRequestStatus = (typeof CONNECTION_REQUEST_STATUSES)[number];

export interface ConnectionRequest {
  id: string;
  pairKey: string;
  fromUid: string;
  toUid: string;
  message: string;
  status: ConnectionRequestStatus;
  createdAt: string;
  respondedAt: string | null;
}

/** Free-tier limits (fallback when `appConfig.limits` is unavailable). */
export const REQUEST_LIMITS_FALLBACK = { maxPendingSent: 3, dailySends: 5 } as const;
export type RequestLimits = { maxPendingSent: number; dailySends: number };

/** A declined pair cannot be re-requested for this many days (master spec J3). */
export const DECLINE_COOLDOWN_DAYS = 90;
/** Pending requests older than this expire via the scheduled function. */
export const REQUEST_EXPIRY_DAYS = 14;

export const MESSAGE_MIN = 2;
export const MESSAGE_MAX = 500;
export const connectionMessageSchema = z.string().trim().min(MESSAGE_MIN).max(MESSAGE_MAX);

/** Canonical, order-independent key for a pair: the two uids sorted and joined
 * with `_` (master spec Section 10, conventions). Also the match id. */
export function makePairKey(a: string, b: string): string {
  return [a, b].sort().join("_");
}

const DAY_MS = 24 * 60 * 60 * 1000;

export type SendRequestDecision =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "self"
        | "senderNotEligible"
        | "recipientNotEligible"
        | "duplicatePending"
        | "alreadyConnected"
        | "declineCooldown"
        | "pendingLimit"
        | "dailyLimit";
    };

export interface SendRequestContext {
  senderUid: string;
  recipientUid: string;
  /** Sender is a verified, active account (Section F2 gate). */
  senderEligible: boolean;
  /** Recipient passes discovery eligibility (opposite gender, verified,
   * visible, active, not blocked either direction) — computed by the caller. */
  recipientEligible: boolean;
  /** Sender's current count of `pending` sent requests. */
  pendingSentCount: number;
  /** Sender's count of requests sent in the last 24h. */
  sentToday: number;
  /** The most recent request for this pair, or null if none exists. */
  latestForPair: Pick<ConnectionRequest, "status" | "respondedAt" | "createdAt"> | null;
  limits: RequestLimits;
  now?: Date;
}

/**
 * The authoritative send decision (CF6). Order matters: identity and
 * eligibility first, then pair-level dedupe / cooldown, then rate limits.
 */
export function canSendRequest(ctx: SendRequestContext): SendRequestDecision {
  if (ctx.senderUid === ctx.recipientUid) return { ok: false, reason: "self" };
  if (!ctx.senderEligible) return { ok: false, reason: "senderNotEligible" };
  if (!ctx.recipientEligible) return { ok: false, reason: "recipientNotEligible" };

  const latest = ctx.latestForPair;
  if (latest) {
    if (latest.status === "pending") return { ok: false, reason: "duplicatePending" };
    if (latest.status === "accepted") return { ok: false, reason: "alreadyConnected" };
    if (latest.status === "declined") {
      const now = ctx.now ?? new Date();
      const since = latest.respondedAt ?? latest.createdAt;
      const elapsedDays = (now.getTime() - new Date(since).getTime()) / DAY_MS;
      if (elapsedDays < DECLINE_COOLDOWN_DAYS) return { ok: false, reason: "declineCooldown" };
    }
  }

  if (ctx.pendingSentCount >= ctx.limits.maxPendingSent) {
    return { ok: false, reason: "pendingLimit" };
  }
  if (ctx.sentToday >= ctx.limits.dailySends) return { ok: false, reason: "dailyLimit" };
  return { ok: true };
}
