import type { VerificationRequest, VerificationType } from "@nisfi/shared";

/**
 * VerificationRepository port (master spec Sections 5.2, F3). The member creates
 * a strictly-shaped `pending` request; decisions (approve/reject) are server-only
 * (staff via the admin console + Cloud Functions). Selfie/ID media is uploaded
 * privately and is never exposed through this port.
 */
export interface VerificationRepository {
  getOwn(uid: string): Promise<VerificationRequest | null>;
  submit(uid: string, type: VerificationType): Promise<VerificationRequest>;
}
