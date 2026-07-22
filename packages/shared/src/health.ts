import { isStaffRole, type Role } from "./role";

/**
 * Operational health (master spec Sections 6.5, 10.11). A sanitized,
 * staff-readable summary written only by Functions — release/environment label,
 * an overall status, and per-subsystem checks — with no tokens, stack traces,
 * provider secrets, or personal data. This is a signal, not a replacement for
 * provider monitoring.
 */
export const HEALTH_STATUSES = ["healthy", "degraded", "down"] as const;
export type HealthStatus = (typeof HEALTH_STATUSES)[number];

export interface HealthCheck {
  status: HealthStatus;
  /** Optional short, non-sensitive note. */
  note?: string;
}

export interface SystemHealth {
  environment: string;
  release: string;
  status: HealthStatus;
  checks: Record<string, HealthCheck>;
  updatedAt: string;
}

/** The health view is staff (moderator+); master spec role matrix. */
export function canViewHealth(role: Role): boolean {
  return isStaffRole(role);
}

const RANK: Record<HealthStatus, number> = { healthy: 0, degraded: 1, down: 2 };

/** Overall status = the worst of the subsystem checks (empty ⇒ healthy). */
export function overallHealth(checks: Record<string, HealthCheck>): HealthStatus {
  let worst: HealthStatus = "healthy";
  for (const check of Object.values(checks)) {
    if (RANK[check.status] > RANK[worst]) worst = check.status;
  }
  return worst;
}
