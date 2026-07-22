import { z } from "zod";
import { isAdminRole, isStaffRole, type Role } from "./role";

/**
 * Report & sanction domain (master spec Sections F8, 10.7, 11). Members report a
 * profile/message/request; moderators triage `open → in_review →
 * resolved|dismissed` and apply sanctions. Report creation is a member write
 * (rules enforce the exact `open` shape); transitions and sanctions are
 * server-only and audited. Sanctions land on `users.status`, enforced by rules.
 */
export const REPORT_REASONS = [
  "fake_profile",
  "inappropriate_photos",
  "harassment",
  "scam",
  "underage",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = ["open", "in_review", "resolved", "dismissed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_TARGET_TYPES = ["profile", "message", "request"] as const;
export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_DETAILS_MAX = 500;

export interface Report {
  id: string;
  reporterUid: string;
  targetUid: string;
  targetType: ReportTargetType;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  handledBy: string | null;
  resolutionNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export const reportInputSchema = z.object({
  targetUid: z.string().trim().min(1),
  targetType: z.enum(REPORT_TARGET_TYPES),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(REPORT_DETAILS_MAX),
});
export type ReportInput = z.infer<typeof reportInputSchema>;

/** A member may report anyone but themselves. */
export function canCreateReport(reporterUid: string, targetUid: string): boolean {
  return reporterUid !== targetUid;
}

/** Terminal statuses cannot transition further. */
const OPEN_STATUSES: readonly ReportStatus[] = ["open", "in_review"];

export type ReportTransitionCheck =
  { ok: true } | { ok: false; reason: "notStaff" | "terminal" | "invalidTarget" };

/** Staff transitions on a non-terminal report to in_review/resolved/dismissed. */
export function canTransitionReport(
  current: ReportStatus,
  next: ReportStatus,
  actorIsStaff: boolean,
): ReportTransitionCheck {
  if (!actorIsStaff) return { ok: false, reason: "notStaff" };
  if (!OPEN_STATUSES.includes(current)) return { ok: false, reason: "terminal" };
  if (next === "open" || next === current) return { ok: false, reason: "invalidTarget" };
  return { ok: true };
}

/** Sanctions a moderator/admin can apply from a case. */
export const SANCTIONS = ["dismiss", "warn", "unpublish", "suspend", "ban"] as const;
export type Sanction = (typeof SANCTIONS)[number];

/** Ban is admin+; every other sanction is any staff (master spec F8). */
export function canApplySanction(role: Role, sanction: Sanction): boolean {
  if (!isStaffRole(role)) return false;
  if (sanction === "ban") return isAdminRole(role);
  return true;
}

/** The `users.status` a sanction sets (or null when it doesn't change status). */
export function sanctionAccountStatus(sanction: Sanction): "suspended" | "banned" | null {
  if (sanction === "suspend") return "suspended";
  if (sanction === "ban") return "banned";
  return null;
}
