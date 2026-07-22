import {
  canApplySanction,
  canTransitionReport,
  sanctionAccountStatus,
  type ReportStatus,
  type ReportTransitionCheck,
  type Role,
  type Sanction,
} from "@nisfi/shared";

/**
 * Report & sanction Cloud Function cores (master spec Sections F8, 12). Report
 * creation is a member write (rules-shaped); transitions and sanctions are
 * server-only. The deployed callables run these in transactions, write the
 * report/`users.status`, notify, and append audit logs. SDK-free and
 * unit-testable; Admin SDK wiring is deferred (O-001).
 */
export type ReportTransitionResult =
  | {
      ok: true;
      update: { status: ReportStatus; handledBy: string; resolvedAt: "now" | null };
    }
  | (ReportTransitionCheck & { ok: false });

export function evaluateReportTransition(
  current: ReportStatus,
  next: ReportStatus,
  actor: { uid: string; isStaff: boolean },
): ReportTransitionResult {
  const check = canTransitionReport(current, next, actor.isStaff);
  if (!check.ok) return check;
  const terminal = next === "resolved" || next === "dismissed";
  return {
    ok: true,
    update: { status: next, handledBy: actor.uid, resolvedAt: terminal ? "now" : null },
  };
}

export type SanctionResult =
  | { ok: true; accountStatus: "suspended" | "banned" | null; sanction: Sanction }
  | { ok: false; reason: "notAllowed" };

export function evaluateSanction(actorRole: Role, sanction: Sanction): SanctionResult {
  if (!canApplySanction(actorRole, sanction)) return { ok: false, reason: "notAllowed" };
  return { ok: true, accountStatus: sanctionAccountStatus(sanction), sanction };
}
