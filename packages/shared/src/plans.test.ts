import { describe, expect, it } from "vitest";
import { canGrantEntitlement, canManageEntitlements, FREE_PLAN, type Plan } from "./plans";

const plans: Plan[] = [
  FREE_PLAN,
  {
    id: "archived",
    name: { ar: "م", en: "a", tr: "a" },
    priceMonthly: 0,
    limits: {},
    active: false,
  },
];

describe("canManageEntitlements", () => {
  it("is superAdmin-only", () => {
    expect(canManageEntitlements("superAdmin")).toBe(true);
    expect(canManageEntitlements("admin")).toBe(false);
    expect(canManageEntitlements("moderator")).toBe(false);
  });
});

describe("canGrantEntitlement", () => {
  it("allows a superAdmin to grant an active plan while subscriptions are off", () => {
    expect(canGrantEntitlement("superAdmin", false, "free", plans)).toEqual({ ok: true });
  });

  it("refuses non-superAdmins", () => {
    expect(canGrantEntitlement("admin", false, "free", plans)).toMatchObject({
      reason: "notSuperAdmin",
    });
  });

  it("refuses when subscriptions are enabled (billing owns it)", () => {
    expect(canGrantEntitlement("superAdmin", true, "free", plans)).toMatchObject({
      reason: "subscriptionsEnabled",
    });
  });

  it("refuses unknown and inactive plans", () => {
    expect(canGrantEntitlement("superAdmin", false, "gold", plans)).toMatchObject({
      reason: "unknownPlan",
    });
    expect(canGrantEntitlement("superAdmin", false, "archived", plans)).toMatchObject({
      reason: "inactivePlan",
    });
  });
});
