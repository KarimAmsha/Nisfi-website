import type { Entitlement, Plan } from "@nisfi/shared";

/**
 * PlanRepository port (master spec Sections 6.4, 10.12). The console reads the
 * plan catalog and a member's entitlement, and (superAdmin) grants an
 * entitlement through a server-side Cloud Function — the change is audited and
 * only permitted while subscriptions are disabled. Clients never write `plans`
 * or `users.entitlements`.
 */
export interface PlanRepository {
  /** The plan catalog (staff/member read). */
  listPlans(): Promise<Plan[]>;
  /** A member's current entitlement, or null if none is recorded. */
  getEntitlement(uid: string): Promise<Entitlement | null>;
  /** Grant a plan to a member (superAdmin-only, audited server-side). */
  grantEntitlement(uid: string, planId: string): Promise<void>;
}
