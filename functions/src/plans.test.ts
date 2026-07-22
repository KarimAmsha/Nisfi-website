import { describe, expect, it } from "vitest";
import { FREE_PLAN } from "@nisfi/shared";
import { evaluateEntitlementGrant } from "./plans";

const superAdmin = { uid: "s1", role: "superAdmin" as const };

describe("evaluateEntitlementGrant (CF core)", () => {
  it("grants an active plan for a superAdmin while subscriptions are off", () => {
    expect(evaluateEntitlementGrant(superAdmin, false, "free", [FREE_PLAN])).toEqual({
      ok: true,
      update: { entitlements: { plan: "free", grantedAt: "now", grantedBy: "s1" } },
    });
  });

  it("refuses non-superAdmins, enabled subscriptions, and unknown plans", () => {
    expect(
      evaluateEntitlementGrant({ uid: "a1", role: "admin" }, false, "free", [FREE_PLAN]),
    ).toMatchObject({ reason: "notSuperAdmin" });
    expect(evaluateEntitlementGrant(superAdmin, true, "free", [FREE_PLAN])).toMatchObject({
      reason: "subscriptionsEnabled",
    });
    expect(evaluateEntitlementGrant(superAdmin, false, "gold", [FREE_PLAN])).toMatchObject({
      reason: "unknownPlan",
    });
  });
});
