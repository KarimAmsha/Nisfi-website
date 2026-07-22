import { describe, expect, it } from "vitest";
import { evaluateRoleAssignment, evaluateStatusChange } from "./users";

describe("evaluateRoleAssignment (CF core)", () => {
  it("assigns a role for a superAdmin acting on someone else", () => {
    expect(evaluateRoleAssignment({ uid: "s1", role: "superAdmin" }, "u1", "moderator")).toEqual({
      ok: true,
      claims: { role: "moderator" },
      mirror: { role: "moderator" },
    });
  });

  it("refuses non-superAdmin and self", () => {
    expect(evaluateRoleAssignment({ uid: "a1", role: "admin" }, "u1", "moderator")).toMatchObject({
      ok: false,
      reason: "notSuperAdmin",
    });
    expect(evaluateRoleAssignment({ uid: "s1", role: "superAdmin" }, "s1", "user")).toMatchObject({
      ok: false,
      reason: "self",
    });
  });
});

describe("evaluateStatusChange (CF core)", () => {
  const target = { uid: "u1", role: "user" as const, status: "active" as const };

  it("suspends (revoking tokens) and reinstates", () => {
    expect(evaluateStatusChange({ uid: "a1", role: "admin" }, target, "suspended")).toEqual({
      ok: true,
      update: { status: "suspended" },
      revokeTokens: true,
    });
    const suspended = { ...target, status: "suspended" as const };
    expect(evaluateStatusChange({ uid: "a1", role: "admin" }, suspended, "active")).toEqual({
      ok: true,
      update: { status: "active" },
      revokeTokens: false,
    });
  });

  it("keeps ban superAdmin-only and refuses protected peers", () => {
    expect(evaluateStatusChange({ uid: "a1", role: "admin" }, target, "banned")).toMatchObject({
      ok: false,
      reason: "notSuperAdmin",
    });
    expect(evaluateStatusChange({ uid: "s1", role: "superAdmin" }, target, "banned")).toMatchObject(
      {
        ok: true,
        revokeTokens: true,
      },
    );
    const peerAdmin = { uid: "a2", role: "admin" as const, status: "active" as const };
    expect(
      evaluateStatusChange({ uid: "a1", role: "admin" }, peerAdmin, "suspended"),
    ).toMatchObject({ ok: false, reason: "protectedTarget" });
  });
});
