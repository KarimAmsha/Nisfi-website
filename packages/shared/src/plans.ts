import { DEFAULT_APP_CONFIG } from "./app-config";
import { type LocalizedText } from "./compatibility";
import { isSuperAdminRole, type Role } from "./role";

/**
 * Plans & entitlements (master spec Sections 6.4, 10.11, 10.12). V1 ships a
 * single free plan and a per-member entitlement that grants the config limits.
 * There is no billing: `appConfig.flags.subscriptionsEnabled` stays off, and
 * the only way an entitlement changes is a superAdmin manual grant (audited).
 * When subscriptions are later enabled, billing owns entitlement changes and
 * the manual path closes. These pure helpers gate that path.
 */
export interface Plan {
  id: string;
  name: LocalizedText;
  /** Monthly price; `null` means free. */
  priceMonthly: number | null;
  limits: Record<string, number>;
  active: boolean;
}

export interface Entitlement {
  plan: string;
  grantedAt: string;
  grantedBy: string | null;
}

/** The one plan seeded in V1 — free, granting the default config limits. */
export const FREE_PLAN: Plan = {
  id: "free",
  name: { ar: "المجاني", en: "Free", tr: "Ücretsiz" },
  priceMonthly: null,
  limits: { ...DEFAULT_APP_CONFIG.limits },
  active: true,
};

/** The default entitlement every member is seeded with (CF1 bootstrap). */
export function defaultEntitlement(): Entitlement {
  return { plan: FREE_PLAN.id, grantedAt: new Date(0).toISOString(), grantedBy: null };
}

/** Viewing the plans/entitlements module is staff; mutating it is superAdmin. */
export function canManageEntitlements(role: Role): boolean {
  return isSuperAdminRole(role);
}

export type EntitlementGrantCheck =
  | { ok: true }
  | {
      ok: false;
      reason: "notSuperAdmin" | "subscriptionsEnabled" | "unknownPlan" | "inactivePlan";
    };

/**
 * A manual entitlement grant is allowed only when: the actor is a superAdmin,
 * subscriptions are still disabled (V1 — billing would otherwise own this), and
 * the target plan exists and is active.
 */
export function canGrantEntitlement(
  role: Role,
  subscriptionsEnabled: boolean,
  planId: string,
  plans: readonly Plan[],
): EntitlementGrantCheck {
  if (!isSuperAdminRole(role)) return { ok: false, reason: "notSuperAdmin" };
  if (subscriptionsEnabled) return { ok: false, reason: "subscriptionsEnabled" };
  const plan = plans.find((p) => p.id === planId);
  if (plan === undefined) return { ok: false, reason: "unknownPlan" };
  if (!plan.active) return { ok: false, reason: "inactivePlan" };
  return { ok: true };
}
