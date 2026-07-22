import { isSuperAdminRole, roleAtLeast, ROLES, type Role } from "./role";

/**
 * User operations authority (master spec Sections 6, F10, 11). The console lets
 * staff search members, assign roles (superAdmin-only), and change account
 * status (suspend/reinstate; a permanent ban is superAdmin-only). Roles live in
 * Firebase custom claims and account status in `users.status`; both are
 * server-only writes (Cloud Functions with audit) — the rules deny client
 * writes and lock suspended/banned members out (`isActive()`). These pure
 * predicates keep the console gating and the server enforcement aligned.
 */
export const ACCOUNT_STATUSES = ["active", "suspended", "banned", "deleted"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

/** A staff-facing member record for the user console. */
export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: Role;
  status: AccountStatus;
  createdAt: string;
  lastActiveAt: string | null;
}

/** Suspended and banned members are locked out of member surfaces. */
export function isLockedOut(status: AccountStatus): boolean {
  return status !== "active";
}

export type RoleAssignmentCheck =
  { ok: true } | { ok: false; reason: "notSuperAdmin" | "self" | "invalidRole" };

/**
 * Role assignment is superAdmin-only, and a superAdmin may not change their own
 * role — that guards against self-lockout and accidentally removing the last
 * superAdmin. The server still re-checks against live claims.
 */
export function canAssignRole(
  actorRole: Role,
  actorUid: string,
  targetUid: string,
  newRole: Role,
): RoleAssignmentCheck {
  if (!isSuperAdminRole(actorRole)) return { ok: false, reason: "notSuperAdmin" };
  if (actorUid === targetUid) return { ok: false, reason: "self" };
  if (!ROLES.includes(newRole)) return { ok: false, reason: "invalidRole" };
  return { ok: true };
}

export type StatusChangeCheck =
  { ok: true } | { ok: false; reason: "notAdmin" | "self" | "notSuperAdmin" | "protectedTarget" };

/**
 * Account-status changes from the user console: suspend and reinstate are any
 * admin+, but a permanent ban (or lifting one) is superAdmin-only. Staff cannot
 * change their own status, nor act on a peer at or above their own rank.
 */
export function canSetAccountStatus(
  actorRole: Role,
  actorUid: string,
  target: { uid: string; role: Role; status: AccountStatus },
  next: AccountStatus,
): StatusChangeCheck {
  if (!roleAtLeast(actorRole, "admin")) return { ok: false, reason: "notAdmin" };
  if (actorUid === target.uid) return { ok: false, reason: "self" };
  // A deleted (anonymized) account is terminal — its status never changes again.
  if (target.status === "deleted") return { ok: false, reason: "protectedTarget" };
  // Never act on a peer at or above the actor's own rank (superAdmin excepted so
  // one superAdmin can still contain another; that path is separately audited).
  if (roleAtLeast(target.role, actorRole) && !isSuperAdminRole(actorRole)) {
    return { ok: false, reason: "protectedTarget" };
  }
  // A ban, and reinstating from a ban, are the heaviest actions — superAdmin-only.
  const touchesBan = next === "banned" || target.status === "banned";
  if (touchesBan && !isSuperAdminRole(actorRole)) {
    return { ok: false, reason: "notSuperAdmin" };
  }
  return { ok: true };
}

/** Case-insensitive match of a free-text query against uid/email/displayName. */
export function matchesUserQuery(user: AdminUser, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  return (
    user.uid.toLowerCase().includes(q) ||
    (user.email?.toLowerCase().includes(q) ?? false) ||
    (user.displayName?.toLowerCase().includes(q) ?? false)
  );
}

export interface UserFilter {
  query?: string;
  role?: Role;
  status?: AccountStatus;
}

/** Combined free-text + role + status filter for the console list. */
export function matchesUserFilter(user: AdminUser, filter: UserFilter): boolean {
  if (filter.role !== undefined && user.role !== filter.role) return false;
  if (filter.status !== undefined && user.status !== filter.status) return false;
  return matchesUserQuery(user, filter.query ?? "");
}
