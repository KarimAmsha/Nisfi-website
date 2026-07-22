import { describe, expect, it } from "vitest";
import {
  canDecideVerification,
  canSubmitVerification,
  verificationOutcome,
  type VerificationRequest,
} from "./verification";

const pending: VerificationRequest = {
  id: "v1",
  uid: "alice",
  type: "selfieId",
  status: "pending",
  reason: null,
  createdAt: "2026-03-01T00:00:00.000Z",
};

describe("canSubmitVerification", () => {
  it("allows a first submission or a resubmit after rejection", () => {
    expect(canSubmitVerification(null)).toBe(true);
    expect(canSubmitVerification({ ...pending, status: "rejected" })).toBe(true);
    expect(canSubmitVerification(pending)).toBe(false);
    expect(canSubmitVerification({ ...pending, status: "approved" })).toBe(false);
  });
});

describe("canDecideVerification", () => {
  it("requires staff and a pending request", () => {
    expect(canDecideVerification(pending, true)).toEqual({ ok: true });
    expect(canDecideVerification(pending, false)).toMatchObject({ reason: "notStaff" });
    expect(canDecideVerification({ ...pending, status: "approved" }, true)).toMatchObject({
      reason: "notPending",
    });
  });
});

describe("verificationOutcome", () => {
  it("maps decisions to request + profile statuses", () => {
    expect(verificationOutcome("approve")).toEqual({
      requestStatus: "approved",
      profileStatus: "verified",
    });
    expect(verificationOutcome("reject")).toEqual({
      requestStatus: "rejected",
      profileStatus: "rejected",
    });
  });
});
