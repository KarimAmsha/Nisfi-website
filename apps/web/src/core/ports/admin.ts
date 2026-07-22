import type {
  AccountStatus,
  AdminUser,
  Photo,
  PhotoDecision,
  Report,
  ReportStatus,
  Role,
  Sanction,
  UserFilter,
  VerificationDecision,
  VerificationRequest,
} from "@nisfi/shared";

/** A pending photo plus its owner uid, for the moderation queue. */
export type PhotoQueueItem = Photo & { uid: string };

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
  /** Pending verification requests, oldest first (staff read). */
  listVerificationQueue(): Promise<VerificationRequest[]>;
  /** Approve/reject a pending request (server transaction + audit, CF5). */
  decideVerification(id: string, decision: VerificationDecision, reason?: string): Promise<void>;
  /** Pending photos across members, oldest first (staff read). */
  listPhotoQueue(): Promise<PhotoQueueItem[]>;
  /** Approve/reject a pending photo (server transaction + audit, CF decidePhoto). */
  decidePhoto(
    uid: string,
    photoId: string,
    decision: PhotoDecision,
    reason?: string,
  ): Promise<void>;
  /** Reports in a status (default `open`), newest first (staff read). */
  listReports(status?: ReportStatus): Promise<Report[]>;
  /** Move a report to a new status (server transaction + audit, CF). */
  transitionReport(id: string, next: ReportStatus): Promise<void>;
  /** Apply a sanction to a member (server transaction + audit, CF). */
  applySanction(targetUid: string, sanction: Sanction, note?: string): Promise<void>;
  /** Members for the user console, newest first (staff read; filtered client-side). */
  listUsers(filter?: UserFilter): Promise<AdminUser[]>;
  /** Assign a role (superAdmin-only; sets the custom claim + mirror, CF). */
  assignRole(uid: string, role: Role): Promise<void>;
  /** Change account status (suspend/reinstate/ban + token revocation, CF). */
  setAccountStatus(uid: string, status: AccountStatus, note?: string): Promise<void>;
}
