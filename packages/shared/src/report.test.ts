import { describe, expect, it } from "vitest";
import {
  canApplySanction,
  canCreateReport,
  canTransitionReport,
  reportInputSchema,
  sanctionAccountStatus,
} from "./report";

describe("canCreateReport", () => {
  it("allows reporting anyone but yourself", () => {
    expect(canCreateReport("omar", "aisha")).toBe(true);
    expect(canCreateReport("omar", "omar")).toBe(false);
  });
});

describe("reportInputSchema", () => {
  it("validates the reason enum and details length", () => {
    expect(
      reportInputSchema.safeParse({
        targetUid: "aisha",
        targetType: "profile",
        reason: "harassment",
        details: "x",
      }).success,
    ).toBe(true);
    expect(
      reportInputSchema.safeParse({
        targetUid: "aisha",
        targetType: "profile",
        reason: "not_a_reason",
        details: "",
      }).success,
    ).toBe(false);
    expect(
      reportInputSchema.safeParse({
        targetUid: "aisha",
        targetType: "profile",
        reason: "scam",
        details: "x".repeat(501),
      }).success,
    ).toBe(false);
  });
});

describe("canTransitionReport", () => {
  it("lets staff move a non-terminal report forward", () => {
    expect(canTransitionReport("open", "in_review", true)).toEqual({ ok: true });
    expect(canTransitionReport("in_review", "resolved", true)).toEqual({ ok: true });
    expect(canTransitionReport("open", "dismissed", true)).toEqual({ ok: true });
  });
  it("refuses non-staff, terminal, and no-op targets", () => {
    expect(canTransitionReport("open", "in_review", false)).toMatchObject({ reason: "notStaff" });
    expect(canTransitionReport("resolved", "open", true)).toMatchObject({ reason: "terminal" });
    expect(canTransitionReport("open", "open", true)).toMatchObject({ reason: "invalidTarget" });
  });
});

describe("canApplySanction / sanctionAccountStatus", () => {
  it("gates ban to admin+, others to any staff", () => {
    expect(canApplySanction("moderator", "warn")).toBe(true);
    expect(canApplySanction("moderator", "ban")).toBe(false);
    expect(canApplySanction("admin", "ban")).toBe(true);
    expect(canApplySanction("user", "warn")).toBe(false);
  });
  it("maps status-changing sanctions", () => {
    expect(sanctionAccountStatus("suspend")).toBe("suspended");
    expect(sanctionAccountStatus("ban")).toBe("banned");
    expect(sanctionAccountStatus("warn")).toBeNull();
    expect(sanctionAccountStatus("dismiss")).toBeNull();
  });
});
