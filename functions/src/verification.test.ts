import { describe, expect, it } from "vitest";
import { evaluateVerificationDecision } from "./verification";

const pending = { status: "pending" as const };
const staff = { uid: "mod1", isStaff: true };

describe("evaluateVerificationDecision (CF5 core)", () => {
  it("approves: sets approved + mirrors verified + approval notice", () => {
    const r = evaluateVerificationDecision(pending, staff, "approve");
    expect(r).toEqual({
      ok: true,
      requestUpdate: { status: "approved", reason: null, decidedBy: "mod1" },
      profileVerification: "verified",
      notificationKey: "verificationApproved",
    });
  });

  it("rejects: keeps the reason, mirrors rejected + rejection notice", () => {
    const r = evaluateVerificationDecision(pending, staff, "reject", "blurry selfie");
    expect(r).toMatchObject({
      ok: true,
      requestUpdate: { status: "rejected", reason: "blurry selfie", decidedBy: "mod1" },
      profileVerification: "rejected",
      notificationKey: "verificationRejected",
    });
  });

  it("refuses a non-staff actor or a non-pending request", () => {
    expect(
      evaluateVerificationDecision(pending, { uid: "u", isStaff: false }, "approve"),
    ).toMatchObject({ ok: false, reason: "notStaff" });
    expect(evaluateVerificationDecision({ status: "approved" }, staff, "approve")).toMatchObject({
      ok: false,
      reason: "notPending",
    });
  });
});
