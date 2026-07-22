/**
 * AdminRepository port (master spec Sections 5.2, F10). Staff-scoped, read-only
 * operational data for the console. All mutations (decisions, sanctions) go
 * through Cloud Functions with audit logging — never direct client writes.
 */
export interface AdminQueueCounts {
  pendingVerifications: number;
  pendingPhotos: number;
  openReports: number;
}

export interface AdminRepository {
  /** Queue sizes for the dashboard + sidebar badges. */
  getQueueCounts(): Promise<AdminQueueCounts>;
}
