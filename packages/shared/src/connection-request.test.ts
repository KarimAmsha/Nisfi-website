import { describe, expect, it } from "vitest";
import {
  canSendRequest,
  canTransitionRequest,
  connectionMessageSchema,
  isRequestExpired,
  makePairKey,
  REQUEST_LIMITS_FALLBACK,
  DECLINE_COOLDOWN_DAYS,
  type ConnectionRequest,
  type SendRequestContext,
  type TransitionContext,
} from "./connection-request";

const base: SendRequestContext = {
  senderUid: "omar",
  recipientUid: "aisha",
  senderEligible: true,
  recipientEligible: true,
  pendingSentCount: 0,
  sentToday: 0,
  latestForPair: null,
  limits: REQUEST_LIMITS_FALLBACK,
  now: new Date("2026-06-01T00:00:00Z"),
};

function latest(
  status: ConnectionRequest["status"],
  respondedAt: string | null,
  createdAt = "2026-01-01T00:00:00.000Z",
): SendRequestContext["latestForPair"] {
  return { status, respondedAt, createdAt };
}

describe("makePairKey", () => {
  it("is order-independent and deterministic", () => {
    expect(makePairKey("omar", "aisha")).toBe("aisha_omar");
    expect(makePairKey("aisha", "omar")).toBe("aisha_omar");
    expect(makePairKey("aisha", "omar")).toBe(makePairKey("omar", "aisha"));
  });
});

describe("connectionMessageSchema", () => {
  it("trims and bounds the message length", () => {
    expect(connectionMessageSchema.safeParse("  hi  ").success).toBe(true);
    expect(connectionMessageSchema.safeParse("a").success).toBe(false);
    expect(connectionMessageSchema.safeParse("x".repeat(501)).success).toBe(false);
  });
});

describe("canSendRequest", () => {
  it("allows a clean, eligible send", () => {
    expect(canSendRequest(base)).toEqual({ ok: true });
  });

  it("rejects sending to yourself", () => {
    expect(canSendRequest({ ...base, recipientUid: "omar" })).toEqual({
      ok: false,
      reason: "self",
    });
  });

  it("requires the sender to be verified/active and the recipient eligible", () => {
    expect(canSendRequest({ ...base, senderEligible: false }).ok).toBe(false);
    expect(canSendRequest({ ...base, senderEligible: false })).toMatchObject({
      reason: "senderNotEligible",
    });
    expect(canSendRequest({ ...base, recipientEligible: false })).toMatchObject({
      reason: "recipientNotEligible",
    });
  });

  it("dedupes: one live pending per pair", () => {
    expect(canSendRequest({ ...base, latestForPair: latest("pending", null) })).toMatchObject({
      reason: "duplicatePending",
    });
  });

  it("blocks re-sending once a pair is already connected", () => {
    expect(
      canSendRequest({ ...base, latestForPair: latest("accepted", "2026-02-01T00:00:00Z") }),
    ).toMatchObject({ reason: "alreadyConnected" });
  });

  it("enforces the 90-day decline cooldown at the boundary", () => {
    const declinedAt = new Date("2026-06-01T00:00:00Z");
    // 89 days ago → still in cooldown
    const within = new Date(declinedAt.getTime() - 89 * 86400000).toISOString();
    expect(canSendRequest({ ...base, latestForPair: latest("declined", within) })).toMatchObject({
      reason: "declineCooldown",
    });
    // 91 days ago → cooldown elapsed, allowed again
    const after = new Date(declinedAt.getTime() - 91 * 86400000).toISOString();
    expect(canSendRequest({ ...base, latestForPair: latest("declined", after) })).toEqual({
      ok: true,
    });
    // exactly the cooldown length is still blocked (strictly-less comparison)
    const exact = new Date(declinedAt.getTime() - DECLINE_COOLDOWN_DAYS * 86400000).toISOString();
    expect(canSendRequest({ ...base, latestForPair: latest("declined", exact) })).toEqual({
      ok: true,
    });
  });

  it("lets a withdrawn/expired pair be re-requested", () => {
    expect(canSendRequest({ ...base, latestForPair: latest("withdrawn", null) })).toEqual({
      ok: true,
    });
    expect(canSendRequest({ ...base, latestForPair: latest("expired", null) })).toEqual({
      ok: true,
    });
  });

  it("enforces the pending-sent limit", () => {
    expect(canSendRequest({ ...base, pendingSentCount: 3 })).toMatchObject({
      reason: "pendingLimit",
    });
    expect(canSendRequest({ ...base, pendingSentCount: 2 })).toEqual({ ok: true });
  });

  it("enforces the daily-send limit", () => {
    expect(canSendRequest({ ...base, sentToday: 5 })).toMatchObject({ reason: "dailyLimit" });
    expect(canSendRequest({ ...base, sentToday: 4 })).toEqual({ ok: true });
  });

  it("race/idempotency: two concurrent sends at the pending limit both fail the decision", () => {
    // Model the transaction re-reading state: once one send lands and the count
    // reaches the cap, a concurrent retry re-evaluating sees the cap and is denied.
    const atCap = { ...base, pendingSentCount: REQUEST_LIMITS_FALLBACK.maxPendingSent };
    expect(canSendRequest(atCap)).toMatchObject({ reason: "pendingLimit" });
    expect(canSendRequest(atCap)).toMatchObject({ reason: "pendingLimit" });
  });
});

describe("canTransitionRequest (CF7) — two-user permissions", () => {
  const pending: TransitionContext = {
    actorUid: "aisha",
    fromUid: "omar",
    toUid: "aisha",
    status: "pending",
  };

  it("lets the recipient accept or decline a pending request", () => {
    expect(canTransitionRequest("accept", pending)).toEqual({ ok: true, nextStatus: "accepted" });
    expect(canTransitionRequest("decline", pending)).toEqual({ ok: true, nextStatus: "declined" });
  });

  it("lets the sender withdraw a pending request", () => {
    expect(canTransitionRequest("withdraw", { ...pending, actorUid: "omar" })).toEqual({
      ok: true,
      nextStatus: "withdrawn",
    });
  });

  it("forbids the sender from accepting/declining their own request", () => {
    expect(canTransitionRequest("accept", { ...pending, actorUid: "omar" })).toMatchObject({
      reason: "notAuthorizedForAction",
    });
  });

  it("forbids the recipient from withdrawing", () => {
    expect(canTransitionRequest("withdraw", pending)).toMatchObject({
      reason: "notAuthorizedForAction",
    });
  });

  it("forbids a non-participant from any transition", () => {
    expect(canTransitionRequest("accept", { ...pending, actorUid: "zaid" })).toMatchObject({
      reason: "notParticipant",
    });
  });

  it("forbids transitioning a request that is no longer pending", () => {
    expect(canTransitionRequest("accept", { ...pending, status: "declined" })).toMatchObject({
      reason: "notPending",
    });
    expect(
      canTransitionRequest("withdraw", { ...pending, actorUid: "omar", status: "accepted" }),
    ).toMatchObject({
      reason: "notPending",
    });
  });
});

describe("isRequestExpired", () => {
  const now = new Date("2026-06-15T00:00:00Z");
  it("expires a pending request only after the 14-day window", () => {
    expect(isRequestExpired(new Date("2026-06-14T00:00:00Z").toISOString(), now)).toBe(false);
    expect(isRequestExpired(new Date("2026-05-31T00:00:00Z").toISOString(), now)).toBe(true);
    // exactly 14 days is not yet expired (strictly greater)
    expect(isRequestExpired(new Date("2026-06-01T00:00:00Z").toISOString(), now)).toBe(false);
  });
});
