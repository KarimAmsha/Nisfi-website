import { isAdminRole, type Role } from "./role";

/**
 * Operational data export (master spec Sections 6.5, 10.11 CF18). Exports run
 * against an allow-listed set of operational tables, are permission-checked
 * (admin+), capped at a row limit, and exclude sensitive columns by default;
 * every export is audited server-side. There is no unrestricted database dump.
 * These pure helpers validate a request and build safe CSV.
 */
export const EXPORT_ROW_LIMIT = 1000;

interface TableSpec {
  /** Columns safe to export. */
  columns: readonly string[];
  /** Columns excluded by default (sensitive); never exported. */
  excluded: readonly string[];
}

export const EXPORTABLE_TABLES = {
  reports: {
    columns: ["id", "targetType", "reason", "status", "handledBy", "createdAt", "resolvedAt"],
    excluded: ["reporterUid", "targetUid", "details"],
  },
  verifications: {
    columns: ["id", "type", "status", "createdAt"],
    excluded: ["uid", "reason"],
  },
  broadcasts: {
    columns: ["id", "audience", "status", "targetedCount", "sentCount", "failedCount", "createdAt"],
    excluded: ["createdBy"],
  },
} as const satisfies Record<string, TableSpec>;
export type ExportTable = keyof typeof EXPORTABLE_TABLES;

/** Running an operational export is admin+ (master spec role matrix). */
export function canExport(role: Role): boolean {
  return isAdminRole(role);
}

export type ExportValidation =
  | { ok: true; columns: string[]; rowLimit: number }
  | { ok: false; reason: "notAllowed" | "unknownTable" | "invalidRowLimit" };

/**
 * Validate an export request: admin+, an allow-listed table, and a row limit in
 * (0, EXPORT_ROW_LIMIT]. Returns the safe (non-sensitive) column set — requested
 * columns are intersected with the allow-list; excluded columns are dropped.
 */
export function validateExportRequest(
  role: Role,
  table: string,
  rowLimit: number = EXPORT_ROW_LIMIT,
  requestedColumns?: readonly string[],
): ExportValidation {
  if (!canExport(role)) return { ok: false, reason: "notAllowed" };
  const spec = (EXPORTABLE_TABLES as Record<string, TableSpec>)[table];
  if (spec === undefined) return { ok: false, reason: "unknownTable" };
  if (!Number.isInteger(rowLimit) || rowLimit <= 0 || rowLimit > EXPORT_ROW_LIMIT) {
    return { ok: false, reason: "invalidRowLimit" };
  }
  const safe = spec.columns.filter(
    (c) => !spec.excluded.includes(c) && (requestedColumns ? requestedColumns.includes(c) : true),
  );
  return { ok: true, columns: safe.length > 0 ? safe : [...spec.columns], rowLimit };
}

/** Escape a single CSV field per RFC 4180 (quote when it contains , " or newline). */
export function csvField(value: unknown): string {
  let s: string;
  if (value === null || value === undefined) s = "";
  else if (typeof value === "string") s = value;
  else if (typeof value === "number" || typeof value === "boolean") s = String(value);
  else s = JSON.stringify(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Build a CSV string from rows, emitting only the given (safe) columns. */
export function toCsv(
  rows: readonly Record<string, unknown>[],
  columns: readonly string[],
): string {
  const header = columns.map(csvField).join(",");
  const body = rows.map((row) => columns.map((c) => csvField(row[c])).join(",")).join("\n");
  return body === "" ? header : `${header}\n${body}`;
}
