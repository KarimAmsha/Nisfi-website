import type { AuditFilter, AuditLogEntry, ExportTable, SystemHealth } from "@nisfi/shared";

/** The result of an export: the safe columns and the generated CSV. */
export interface ExportOutput {
  columns: string[];
  csv: string;
  rowCount: number;
}

/**
 * OpsRepository port (master spec Section 6.5). The superAdmin audit explorer,
 * the admin+ export path, and the staff health view. Audit is read-only and
 * immutable; exports run server-side (permission/row/column checked + audited);
 * health is a sanitized Functions-written summary. Clients never write any of
 * these.
 */
export interface OpsRepository {
  /** Audit entries matching the filter, newest first (superAdmin read). */
  listAudit(filter?: AuditFilter): Promise<AuditLogEntry[]>;
  /** Run a privacy-safe export (admin+, server-side validated + audited). */
  exportTable(table: ExportTable): Promise<ExportOutput>;
  /** The current sanitized health summary (staff read), or null if none. */
  getHealth(): Promise<SystemHealth | null>;
}
