import { isSuperAdminRole, type Role } from "./role";

/**
 * Audit log (master spec Sections 6.5, 10.11). Every staff action is appended
 * to `auditLogs` by Cloud Functions — the log is immutable and superAdmin-only
 * to read; there is no edit or delete. These helpers gate the explorer, filter
 * entries, and redact sensitive metadata so a viewer never sees tokens,
 * secrets, or personal identifiers even if a poorly-shaped event stored them.
 */
export const AUDIT_ACTIONS = [
  "verificationDecision",
  "photoDecision",
  "reportTransition",
  "sanction",
  "roleAssignment",
  "statusChange",
  "configChange",
  "questionWrite",
  "broadcast",
  "entitlementGrant",
  "export",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorRole: Role;
  /** One of {@link AUDIT_ACTIONS}; typed as string for forward-compat. */
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

/** The audit explorer is superAdmin-only (master spec role matrix). */
export function canViewAudit(role: Role): boolean {
  return isSuperAdminRole(role);
}

export interface AuditFilter {
  actorUid?: string;
  action?: string;
  targetId?: string;
  /** Inclusive ISO date-time lower/upper bounds. */
  from?: string;
  to?: string;
}

/** In-memory filter mirroring the server query (actor/action/target/date). */
export function matchesAuditFilter(entry: AuditLogEntry, filter: AuditFilter): boolean {
  if (filter.actorUid && entry.actorUid !== filter.actorUid) return false;
  if (filter.action && entry.action !== filter.action) return false;
  if (filter.targetId && entry.targetId !== filter.targetId) return false;
  if (filter.from && entry.createdAt < filter.from) return false;
  if (filter.to && entry.createdAt > filter.to) return false;
  return true;
}

/** Substrings that mark a metadata key as sensitive (case-insensitive). */
const SENSITIVE_KEY_PARTS = [
  "token",
  "secret",
  "password",
  "apikey",
  "authorization",
  "cookie",
  "session",
  "email",
  "phone",
  "address",
  "ip",
  "nationalid",
  "idnumber",
  "dob",
  "birthdate",
  "photourl",
  "selfie",
  "credential",
] as const;

export const REDACTED = "[redacted]";

function isSensitiveKey(key: string): boolean {
  const k = key.toLowerCase();
  return SENSITIVE_KEY_PARTS.some((part) => k.includes(part));
}

/**
 * Return a copy of `metadata` with sensitive values replaced by `[redacted]`,
 * recursing into nested plain objects. Non-sensitive scalars pass through.
 */
export function redactAuditMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (isSensitiveKey(key)) {
      out[key] = REDACTED;
    } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      out[key] = redactAuditMetadata(value as Record<string, unknown>);
    } else {
      out[key] = value;
    }
  }
  return out;
}
