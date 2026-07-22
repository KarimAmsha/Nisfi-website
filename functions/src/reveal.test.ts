import { describe, expect, it } from "vitest";
import { evaluateRevealAccess, evaluateSetPhotoReveal } from "./reveal";

const active = { uids: ["aisha", "omar"], status: "active" as const };

describe("evaluateSetPhotoReveal (CF setPhotoReveal core)", () => {
  it("targets the actor's own reveal field", () => {
    expect(evaluateSetPhotoReveal(active, "omar", true)).toEqual({
      ok: true,
      field: "photoReveal.omar",
      value: true,
    });
  });

  it("refuses a non-participant or a closed match", () => {
    expect(evaluateSetPhotoReveal(active, "zaid", true)).toMatchObject({ reason: "notAllowed" });
    expect(evaluateSetPhotoReveal({ ...active, status: "closed" }, "omar", true)).toMatchObject({
      reason: "notAllowed",
    });
  });
});

describe("evaluateRevealAccess (getRevealedPhotoUrls core)", () => {
  it("authorizes only a member whose counterparty has revealed", () => {
    const m = { uids: ["aisha", "omar"], photoReveal: { omar: true } };
    expect(evaluateRevealAccess(m, "aisha")).toEqual({ ok: true });
    expect(evaluateRevealAccess(m, "omar")).toMatchObject({ reason: "notRevealed" });
    expect(evaluateRevealAccess(m, "zaid")).toMatchObject({ reason: "notParticipant" });
  });

  it("denies access after the counterparty revokes", () => {
    const m = { uids: ["aisha", "omar"], photoReveal: { omar: false } };
    expect(evaluateRevealAccess(m, "aisha")).toMatchObject({ reason: "notRevealed" });
  });
});
