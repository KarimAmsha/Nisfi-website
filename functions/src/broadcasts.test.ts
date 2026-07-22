import { describe, expect, it } from "vitest";
import { evaluateBroadcastDispatch, summarizeDelivery } from "./broadcasts";

const input = {
  audience: "verified",
  title: { ar: "عنوان", en: "Title", tr: "Başlık" },
  body: { ar: "نص", en: "Body", tr: "Metin" },
};

describe("evaluateBroadcastDispatch (CF core)", () => {
  it("dispatches a valid draft for an admin, moving it to sending", () => {
    expect(evaluateBroadcastDispatch("admin", input, 42, "draft")).toEqual({
      ok: true,
      audience: "verified",
      update: { status: "sending", targetedCount: 42 },
    });
  });

  it("refuses non-admins, invalid input, and duplicate dispatch (idempotency)", () => {
    expect(evaluateBroadcastDispatch("moderator", input, 1, "draft")).toMatchObject({
      reason: "notAllowed",
    });
    expect(evaluateBroadcastDispatch("admin", { audience: "bad" }, 1, "draft")).toMatchObject({
      reason: "invalid",
    });
    expect(evaluateBroadcastDispatch("admin", input, 1, "sending")).toMatchObject({
      reason: "alreadyDispatched",
    });
    expect(evaluateBroadcastDispatch("admin", input, 1, "sent")).toMatchObject({
      reason: "alreadyDispatched",
    });
  });

  it("allows retrying a failed broadcast", () => {
    expect(evaluateBroadcastDispatch("admin", input, 5, "failed")).toMatchObject({ ok: true });
  });
});

describe("summarizeDelivery", () => {
  it("is sent only when every recipient succeeded", () => {
    expect(summarizeDelivery(10, 10, 0)).toEqual({ status: "sent", sentCount: 10, failedCount: 0 });
    expect(summarizeDelivery(10, 8, 2)).toEqual({ status: "failed", sentCount: 8, failedCount: 2 });
    expect(summarizeDelivery(10, 9, 0)).toMatchObject({ status: "failed" });
  });
});
