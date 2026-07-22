import { describe, expect, it } from "vitest";
import { buildHealthSummary, evaluateExport } from "./ops";

describe("evaluateExport (CF18 core)", () => {
  it("returns safe columns + an audit record for an admin", () => {
    const res = evaluateExport({ uid: "a1", role: "admin" }, "reports", 100);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.columns).not.toContain("reporterUid");
      expect(res.rowLimit).toBe(100);
      expect(res.audit).toMatchObject({ actorUid: "a1", table: "reports" });
    }
  });

  it("refuses non-admins, unknown tables, and bad limits", () => {
    expect(evaluateExport({ uid: "m", role: "moderator" }, "reports")).toMatchObject({
      reason: "notAllowed",
    });
    expect(evaluateExport({ uid: "a1", role: "admin" }, "secrets")).toMatchObject({
      reason: "unknownTable",
    });
    expect(evaluateExport({ uid: "a1", role: "admin" }, "reports", 99999)).toMatchObject({
      reason: "invalidRowLimit",
    });
  });
});

describe("buildHealthSummary (CF20 core)", () => {
  it("derives overall status from checks and keeps only safe fields", () => {
    const summary = buildHealthSummary("production", "1.4.0", {
      firestore: { status: "healthy" },
      functions: { status: "degraded", note: "elevated latency" },
    });
    expect(summary).toEqual({
      environment: "production",
      release: "1.4.0",
      status: "degraded",
      checks: {
        firestore: { status: "healthy" },
        functions: { status: "degraded", note: "elevated latency" },
      },
    });
  });
});
