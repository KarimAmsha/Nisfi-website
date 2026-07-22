import { describe, expect, it } from "vitest";
import { evaluateAccept, evaluateCloseMatch } from "./matches";
import type { TransitionReadState } from "./connection-requests";

const participants = {
  omar: { displayName: "عمر", primaryBlurredPath: null },
  aisha: { displayName: "عائشة", primaryBlurredPath: null },
};

const acceptState: TransitionReadState = {
  requestId: "req1",
  actorUid: "aisha",
  fromUid: "omar",
  toUid: "aisha",
  status: "pending",
};

describe("evaluateAccept (CF7 accept → match)", () => {
  it("creates the match keyed by pairKey when the recipient accepts", () => {
    const result = evaluateAccept(acceptState, participants);
    expect(result.ok).toBe(true);
    expect(result.matchId).toBe("aisha_omar");
    expect(result.match?.status).toBe("active");
    expect(result.match?.requestId).toBe("req1");
    expect(result.match?.uids).toEqual(["aisha", "omar"]);
  });

  it("does not create a match when the transition is unauthorized", () => {
    const result = evaluateAccept({ ...acceptState, actorUid: "omar" }, participants);
    expect(result.ok).toBe(false);
    expect(result.match).toBeUndefined();
    expect(result.reason).toBe("notAuthorizedForAction");
  });

  it("does not create a match for a non-pending request", () => {
    const result = evaluateAccept({ ...acceptState, status: "accepted" }, participants);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("notPending");
  });
});

describe("evaluateCloseMatch (CF closeMatch core)", () => {
  const active = { uids: ["aisha", "omar"], status: "active" as const };

  it("produces the closed state for a participant", () => {
    const result = evaluateCloseMatch(active, "omar");
    expect(result).toEqual({
      ok: true,
      update: { status: "closed", closedBy: "omar", closedReason: "user_closed" },
    });
  });

  it("refuses a non-participant and an already-closed match", () => {
    expect(evaluateCloseMatch(active, "zaid")).toMatchObject({ reason: "notParticipant" });
    expect(evaluateCloseMatch({ ...active, status: "closed" }, "omar")).toMatchObject({
      reason: "alreadyClosed",
    });
  });
});
