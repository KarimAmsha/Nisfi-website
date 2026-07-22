import { describe, expect, it } from "vitest";
import { canDeleteMessage, containsBannedWord, isValidMessageText, messagePreview } from "./chat";

describe("isValidMessageText", () => {
  it("requires 1–1000 non-empty characters", () => {
    expect(isValidMessageText("hi")).toBe(true);
    expect(isValidMessageText("   ")).toBe(false);
    expect(isValidMessageText("")).toBe(false);
    expect(isValidMessageText("x".repeat(1000))).toBe(true);
    expect(isValidMessageText("x".repeat(1001))).toBe(false);
  });
});

describe("canDeleteMessage", () => {
  const now = new Date("2026-06-01T12:00:00Z");
  const base = { senderUid: "omar", deleted: false, createdAt: "2026-06-01T11:50:00Z" };

  it("lets the sender delete their own message within 15 minutes", () => {
    expect(canDeleteMessage(base, "omar", now)).toBe(true);
  });

  it("refuses after the window, for others, or if already deleted", () => {
    expect(canDeleteMessage({ ...base, createdAt: "2026-06-01T11:40:00Z" }, "omar", now)).toBe(
      false,
    );
    expect(canDeleteMessage(base, "aisha", now)).toBe(false);
    expect(canDeleteMessage({ ...base, deleted: true }, "omar", now)).toBe(false);
  });
});

describe("containsBannedWord", () => {
  it("matches case-insensitively and ignores empty terms", () => {
    expect(containsBannedWord("Call me on WhatsApp", ["whatsapp"])).toBe(true);
    expect(containsBannedWord("all good here", ["", "  "])).toBe(false);
    expect(containsBannedWord("nothing banned", ["telegram"])).toBe(false);
  });
});

describe("messagePreview", () => {
  it("collapses whitespace and truncates", () => {
    expect(messagePreview("  hello   world  ")).toBe("hello world");
    expect(messagePreview("x".repeat(100), 10)).toBe(`${"x".repeat(9)}…`);
  });
});
