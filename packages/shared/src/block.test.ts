import { describe, expect, it } from "vitest";
import { canBlock } from "./block";
import { unreadCount, type AppNotification } from "./notification";

describe("canBlock", () => {
  it("allows blocking another member but not yourself", () => {
    expect(canBlock("omar", "aisha")).toEqual({ ok: true });
    expect(canBlock("omar", "omar")).toEqual({ ok: false, reason: "self" });
  });
});

describe("unreadCount", () => {
  const n = (id: string, read: boolean): AppNotification => ({
    id,
    type: "requestReceived",
    titleKey: "t",
    bodyKey: "b",
    params: {},
    link: null,
    read,
    createdAt: "2026-03-01T00:00:00.000Z",
  });

  it("counts only unread notifications", () => {
    expect(unreadCount([n("1", false), n("2", true), n("3", false)])).toBe(2);
    expect(unreadCount([])).toBe(0);
  });
});
