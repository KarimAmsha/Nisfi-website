import type { ReportInput } from "@nisfi/shared";

/**
 * ReportRepository port (master spec Sections 5.2, F8). A member files a report
 * about a profile/message/request; the rules enforce the exact `open` shape.
 * Triage and sanctions are staff/server operations (AdminRepository + CFs).
 */
export interface ReportRepository {
  createReport(reporterUid: string, input: ReportInput): Promise<void>;
}
