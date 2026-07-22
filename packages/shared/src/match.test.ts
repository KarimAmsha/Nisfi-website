import { describe, expect, it } from "vitest";
import { buildAcceptedMatch, isParticipant, otherUid } from "./match";

const request = { id: "req1", fromUid: "omar", toUid: "aisha" };
const participants = {
  omar: { displayName: "عمر", primaryBlurredPath: null },
  aisha: { displayName: "عائشة", primaryBlurredPath: null },
};

describe("buildAcceptedMatch", () => {
  it("builds an active match with a sorted uid pair and pairKey id", () => {
    const match = buildAcceptedMatch(request, participants);
    expect(match.pairKey).toBe("aisha_omar");
    expect(match.uids).toEqual(["aisha", "omar"]);
    expect(match.status).toBe("active");
    expect(match.requestId).toBe("req1");
    expect(match.unread).toEqual({ aisha: 0, omar: 0 });
    expect(match.photoReveal).toEqual({ aisha: false, omar: false });
    expect(match.lastMessageAt).toBeNull();
  });

  it("is idempotent by pairKey regardless of who sent the request", () => {
    const a = buildAcceptedMatch({ id: "r", fromUid: "omar", toUid: "aisha" }, participants);
    const b = buildAcceptedMatch({ id: "r", fromUid: "aisha", toUid: "omar" }, participants);
    expect(a.pairKey).toBe(b.pairKey);
    expect(a.uids).toEqual(b.uids);
  });
});

describe("otherUid / isParticipant", () => {
  const match = { uids: ["aisha", "omar"] as [string, string] };
  it("returns the counterparty for a member and null for an outsider", () => {
    expect(otherUid(match, "omar")).toBe("aisha");
    expect(otherUid(match, "aisha")).toBe("omar");
    expect(otherUid(match, "zaid")).toBeNull();
  });
  it("checks membership", () => {
    expect(isParticipant(match, "omar")).toBe(true);
    expect(isParticipant(match, "zaid")).toBe(false);
  });
});
