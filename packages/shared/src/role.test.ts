import { describe, expect, it } from "vitest";
import { isAdminRole, isStaffRole, isSuperAdminRole, roleAtLeast } from "./role";

describe("role helpers", () => {
  it("classifies staff/admin/superAdmin by rank", () => {
    expect(isStaffRole("user")).toBe(false);
    expect(isStaffRole("moderator")).toBe(true);
    expect(isAdminRole("moderator")).toBe(false);
    expect(isAdminRole("admin")).toBe(true);
    expect(isSuperAdminRole("admin")).toBe(false);
    expect(isSuperAdminRole("superAdmin")).toBe(true);
  });

  it("compares against a required minimum", () => {
    expect(roleAtLeast("admin", "moderator")).toBe(true);
    expect(roleAtLeast("moderator", "admin")).toBe(false);
    expect(roleAtLeast("superAdmin", "superAdmin")).toBe(true);
    expect(roleAtLeast("user", "moderator")).toBe(false);
  });
});
