import { describe, expect, it } from "vitest";
import {
  evaluateSendRequest,
  evaluateTransition,
  type SendRequestReadState,
} from "./connection-requests";

const state: SendRequestReadState = {
  senderUid: "omar",
  recipientUid: "aisha",
  senderEligible: true,
  recipientEligible: true,
  pendingSentCount: 0,
  sentToday: 0,
  latestForPair: null,
};

describe("evaluateSendRequest (CF6 core)", () => {
  it("produces a strictly-shaped pending request document on success", () => {
    const result = evaluateSendRequest(state, "  Assalamu alaikum  ");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pairKey).toBe("aisha_omar");
      expect(result.request).toEqual({
        pairKey: "aisha_omar",
        fromUid: "omar",
        toUid: "aisha",
        message: "  Assalamu alaikum  ",
        status: "pending",
        respondedAt: null,
      });
    }
  });

  it("propagates the shared denial reasons without writing a document", () => {
    expect(evaluateSendRequest({ ...state, pendingSentCount: 3 }, "hi")).toMatchObject({
      ok: false,
      reason: "pendingLimit",
    });
    expect(evaluateSendRequest({ ...state, recipientUid: "omar" }, "hi")).toMatchObject({
      ok: false,
      reason: "self",
    });
  });
});

describe("evaluateTransition (CF7 core)", () => {
  const pending = {
    actorUid: "aisha",
    fromUid: "omar",
    toUid: "aisha",
    status: "pending" as const,
  };

  it("resolves the next status for an authorized recipient accept", () => {
    expect(evaluateTransition("accept", pending)).toEqual({ ok: true, nextStatus: "accepted" });
  });

  it("denies a sender accepting their own request", () => {
    expect(evaluateTransition("accept", { ...pending, actorUid: "omar" })).toMatchObject({
      ok: false,
      reason: "notAuthorizedForAction",
    });
  });
});
