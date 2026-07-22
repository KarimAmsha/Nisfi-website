import { canGrantEntitlement, type Plan, type Role } from "@nisfi/shared";

/**
 * Plans/entitlements Cloud Function core (master spec Sections 6.4, 12). A
 * manual entitlement grant is superAdmin-only and allowed only while
 * subscriptions are disabled (V1 has no billing); the target plan must exist
 * and be active. The result carries the `users.entitlements` update so the
 * deployed callable writes it and appends an immutable audit event. SDK-free
 * and unit-testable; Admin SDK wiring is deferred (O-001).
 */
export type EntitlementGrantResult =
  | {
      ok: true;
      update: { entitlements: { plan: string; grantedAt: "now"; grantedBy: string } };
    }
  | {
      ok: false;
      reason: "notSuperAdmin" | "subscriptionsEnabled" | "unknownPlan" | "inactivePlan";
    };

export function evaluateEntitlementGrant(
  actor: { uid: string; role: Role },
  subscriptionsEnabled: boolean,
  planId: string,
  plans: readonly Plan[],
): EntitlementGrantResult {
  const check = canGrantEntitlement(actor.role, subscriptionsEnabled, planId, plans);
  if (!check.ok) return check;
  return {
    ok: true,
    update: { entitlements: { plan: planId, grantedAt: "now", grantedBy: actor.uid } },
  };
}
