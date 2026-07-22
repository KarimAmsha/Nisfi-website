import {
  overallHealth,
  redactAuditMetadata,
  validateExportRequest,
  type HealthCheck,
  type HealthStatus,
  type Role,
} from "@nisfi/shared";

/**
 * Operations Cloud Function cores (master spec Sections 6.5, 12): export
 * (CF18) and health refresh (CF20). Exports are permission-checked, row/column
 * bounded, and audited; the health summary is sanitized (no secrets, stack
 * traces, or personal data). Audit metadata is redacted before it is ever
 * surfaced. SDK-free and unit-testable; Admin SDK wiring is deferred (O-001).
 */
export type ExportResult =
  | { ok: true; table: string; columns: string[]; rowLimit: number; audit: Record<string, unknown> }
  | { ok: false; reason: "notAllowed" | "unknownTable" | "invalidRowLimit" };

export function evaluateExport(
  actor: { uid: string; role: Role },
  table: string,
  rowLimit?: number,
  requestedColumns?: readonly string[],
): ExportResult {
  const validation = validateExportRequest(actor.role, table, rowLimit, requestedColumns);
  if (!validation.ok) return validation;
  return {
    ok: true,
    table,
    columns: validation.columns,
    rowLimit: validation.rowLimit,
    // The export itself is an audited event (who exported what scope).
    audit: redactAuditMetadata({
      actorUid: actor.uid,
      table,
      columns: validation.columns,
      rowLimit: validation.rowLimit,
    }),
  };
}

/**
 * Build the sanitized health summary written to `systemHealth`. Only the
 * environment/release labels and per-check statuses/notes are kept — any other
 * fields (which might carry secrets) are dropped, and the overall status is
 * derived from the checks.
 */
export function buildHealthSummary(
  environment: string,
  release: string,
  checks: Record<string, { status: HealthStatus; note?: string }>,
): {
  environment: string;
  release: string;
  status: HealthStatus;
  checks: Record<string, HealthCheck>;
} {
  const safeChecks: Record<string, HealthCheck> = {};
  for (const [name, check] of Object.entries(checks)) {
    safeChecks[name] =
      check.note !== undefined
        ? { status: check.status, note: check.note }
        : { status: check.status };
  }
  return { environment, release, status: overallHealth(safeChecks), checks: safeChecks };
}
