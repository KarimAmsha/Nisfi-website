import { describe, expect, it } from "vitest";
import { evaluateReportTransition, evaluateSanction } from "./reports";

const staff = { uid: "mod1", isStaff: true };

describe("evaluateReportTransition (CF core)", () => {
  it("moves open → in_review (no resolvedAt)", () => {
    expect(evaluateReportTransition("open", "in_review", staff)).toEqual({
      ok: true,
      update: { status: "in_review", handledBy: "mod1", resolvedAt: null },
    });
  });

  it("resolves with a resolvedAt marker", () => {
    expect(evaluateReportTransition("in_review", "resolved", staff)).toEqual({
      ok: true,
      update: { status: "resolved", handledBy: "mod1", resolvedAt: "now" },
    });
  });

  it("refuses non-staff and terminal reports", () => {
    expect(
      evaluateReportTransition("open", "resolved", { uid: "u", isStaff: false }),
    ).toMatchObject({ ok: false, reason: "notStaff" });
    expect(evaluateReportTransition("resolved", "open", staff)).toMatchObject({
      reason: "terminal",
    });
  });
});

describe("evaluateSanction (CF core)", () => {
  it("suspends/bans set account status; ban needs admin+", () => {
    expect(evaluateSanction("moderator", "suspend")).toEqual({
      ok: true,
      accountStatus: "suspended",
      sanction: "suspend",
    });
    expect(evaluateSanction("admin", "ban")).toMatchObject({ ok: true, accountStatus: "banned" });
    expect(evaluateSanction("moderator", "ban")).toMatchObject({ ok: false, reason: "notAllowed" });
    expect(evaluateSanction("moderator", "warn")).toMatchObject({ ok: true, accountStatus: null });
  });
});
