import {
  canAssignRole,
  canSetAccountStatus,
  type AccountStatus,
  type RoleAssignmentCheck,
  type Role,
  type StatusChangeCheck,
} from "@nisfi/shared";

/**
 * User-operations Cloud Function cores (master spec Sections 6, F10, 12). Role
 * assignment (superAdmin-only) and account-status changes (suspend/reinstate by
 * admin+, ban by superAdmin) are server-only. The deployed callables run these,
 * then set the custom claim / `users.status` with the Admin SDK, revoke tokens
 * on lockout, and append an immutable audit event. SDK-free and unit-testable;
 * Admin SDK wiring is deferred (O-001).
 */
export type RoleAssignmentActor = { uid: string; role: Role };

export type RoleAssignmentResult =
  | { ok: true; claims: { role: Role }; mirror: { role: Role } }
  | (RoleAssignmentCheck & { ok: false });

export function evaluateRoleAssignment(
  actor: RoleAssignmentActor,
  targetUid: string,
  newRole: Role,
): RoleAssignmentResult {
  const check = canAssignRole(actor.role, actor.uid, targetUid, newRole);
  if (!check.ok) return check;
  // The claim is authoritative; the Firestore field is a read-only mirror.
  return { ok: true, claims: { role: newRole }, mirror: { role: newRole } };
}

export type StatusChangeResult =
  | { ok: true; update: { status: AccountStatus }; revokeTokens: boolean }
  | (StatusChangeCheck & { ok: false });

export function evaluateStatusChange(
  actor: RoleAssignmentActor,
  target: { uid: string; role: Role; status: AccountStatus },
  next: AccountStatus,
): StatusChangeResult {
  const check = canSetAccountStatus(actor.role, actor.uid, target, next);
  if (!check.ok) return check;
  // Locking a member out (suspend/ban) revokes their refresh tokens so open
  // sessions can't outlive the sanction; reinstating does not.
  const revokeTokens = next !== "active";
  return { ok: true, update: { status: next }, revokeTokens };
}
