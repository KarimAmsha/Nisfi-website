import { describe, expect, it } from "vitest";
import { shouldSendMessagePush } from "./push";

describe("shouldSendMessagePush (throttle: 1 per match per 5 min)", () => {
  const now = new Date("2026-06-01T12:00:00Z");

  it("always pushes when there is no prior push", () => {
    expect(shouldSendMessagePush(null, now)).toBe(true);
  });

  it("suppresses a push inside the 5-minute window", () => {
    expect(shouldSendMessagePush("2026-06-01T11:57:00Z", now)).toBe(false);
  });

  it("allows a push once the window has elapsed", () => {
    expect(shouldSendMessagePush("2026-06-01T11:55:00Z", now)).toBe(true);
    expect(shouldSendMessagePush("2026-06-01T11:50:00Z", now)).toBe(true);
  });
});
