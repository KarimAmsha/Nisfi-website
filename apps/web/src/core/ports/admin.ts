import type {
  Photo,
  PhotoDecision,
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
}
