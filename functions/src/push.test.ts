import { describe, expect, it } from "vitest";
import { isInvalidTokenError, shouldPushMessage } from "./push";

describe("shouldPushMessage (CF throttle)", () => {
  const now = new Date("2026-06-01T12:00:00Z");
  it("throttles to one push per match per 5 minutes", () => {
    expect(shouldPushMessage(null, now)).toBe(true);
    expect(shouldPushMessage("2026-06-01T11:58:00Z", now)).toBe(false);
    expect(shouldPushMessage("2026-06-01T11:54:00Z", now)).toBe(true);
  });
});

describe("isInvalidTokenError", () => {
  it("flags FCM codes that require pruning the device token", () => {
    expect(isInvalidTokenError("messaging/registration-token-not-registered")).toBe(true);
    expect(isInvalidTokenError("messaging/invalid-registration-token")).toBe(true);
    expect(isInvalidTokenError("messaging/quota-exceeded")).toBe(false);
  });
});
