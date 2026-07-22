import { describe, expect, it } from "vitest";
import { evaluatePhotoDecision } from "./photos";

const pending = { moderation: "pending" as const };
const staff = { uid: "mod1", isStaff: true };

describe("evaluatePhotoDecision (CF decidePhoto core)", () => {
  it("approves: publishes the blurred variant", () => {
    expect(evaluatePhotoDecision(pending, staff, "approve")).toEqual({
      ok: true,
      moderation: "approved",
      reason: null,
      decidedBy: "mod1",
      publishBlurred: true,
    });
  });

  it("rejects: keeps the reason and never publishes", () => {
    expect(evaluatePhotoDecision(pending, staff, "reject", "not a real photo")).toMatchObject({
      ok: true,
      moderation: "rejected",
      reason: "not a real photo",
      publishBlurred: false,
    });
  });

  it("refuses non-staff or a non-pending photo", () => {
    expect(evaluatePhotoDecision(pending, { uid: "u", isStaff: false }, "approve")).toMatchObject({
      ok: false,
      reason: "notStaff",
    });
    expect(evaluatePhotoDecision({ moderation: "approved" }, staff, "approve")).toMatchObject({
      ok: false,
      reason: "notPending",
    });
  });
});
