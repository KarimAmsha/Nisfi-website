import { describe, expect, it } from "vitest";
import {
  canAssignRole,
  canSetAccountStatus,
  isLockedOut,
  matchesUserFilter,
  matchesUserQuery,
  type AdminUser,
} from "./user-admin";

const member: AdminUser = {
  uid: "u_omar",
  email: "omar@example.com",
  displayName: "Omar",
  role: "user",
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastActiveAt: null,
};

describe("isLockedOut", () => {
  it("locks out suspended and banned, not active", () => {
    expect(isLockedOut("active")).toBe(false);
    expect(isLockedOut("suspended")).toBe(true);
    expect(isLockedOut("banned")).toBe(true);
  });
});

describe("canAssignRole", () => {
  it("is superAdmin-only and never on yourself", () => {
    expect(canAssignRole("superAdmin", "s1", "u1", "moderator")).toEqual({ ok: true });
    expect(canAssignRole("admin", "a1", "u1", "moderator")).toMatchObject({
      reason: "notSuperAdmin",
    });
    expect(canAssignRole("superAdmin", "s1", "s1", "user")).toMatchObject({ reason: "self" });
  });
});

describe("canSetAccountStatus", () => {
  const target = { uid: "u_omar", role: "user" as const, status: "active" as const };

  it("lets admin+ suspend/reinstate a member", () => {
    expect(canSetAccountStatus("admin", "a1", target, "suspended")).toEqual({ ok: true });
    expect(canSetAccountStatus("moderator", "m1", target, "suspended")).toMatchObject({
      reason: "notAdmin",
    });
  });

  it("keeps ban (and lifting a ban) superAdmin-only", () => {
    expect(canSetAccountStatus("admin", "a1", target, "banned")).toMatchObject({
      reason: "notSuperAdmin",
    });
    expect(canSetAccountStatus("superAdmin", "s1", target, "banned")).toEqual({ ok: true });
    const banned = { ...target, status: "banned" as const };
    expect(canSetAccountStatus("admin", "a1", banned, "active")).toMatchObject({
      reason: "notSuperAdmin",
    });
    expect(canSetAccountStatus("superAdmin", "s1", banned, "active")).toEqual({ ok: true });
  });

  it("refuses self and protected peers of equal/greater rank", () => {
    expect(canSetAccountStatus("admin", "a1", { ...target, uid: "a1" }, "suspended")).toMatchObject(
      { reason: "self" },
    );
    const peerAdmin = { uid: "a2", role: "admin" as const, status: "active" as const };
    expect(canSetAccountStatus("admin", "a1", peerAdmin, "suspended")).toMatchObject({
      reason: "protectedTarget",
    });
    // A superAdmin can still act on an admin.
    expect(canSetAccountStatus("superAdmin", "s1", peerAdmin, "suspended")).toEqual({ ok: true });
  });
});

describe("matchesUserQuery / matchesUserFilter", () => {
  it("matches uid, email, and display name case-insensitively", () => {
    expect(matchesUserQuery(member, "")).toBe(true);
    expect(matchesUserQuery(member, "OMAR")).toBe(true);
    expect(matchesUserQuery(member, "example.com")).toBe(true);
    expect(matchesUserQuery(member, "zzz")).toBe(false);
  });

  it("combines query with role and status filters", () => {
    expect(matchesUserFilter(member, { role: "user", status: "active" })).toBe(true);
    expect(matchesUserFilter(member, { role: "admin" })).toBe(false);
    expect(matchesUserFilter(member, { status: "banned" })).toBe(false);
    expect(matchesUserFilter(member, { query: "omar", role: "user" })).toBe(true);
  });
});
