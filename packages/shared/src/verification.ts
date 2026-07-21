/**
 * Identity-verification domain types (master spec Sections F3, 10.3, 11.2).
 * Manual review in V1. The selfie/ID media is sensitive and private — it is
 * never shown to members and never placed on the public image platform;
 * staff access is via short-lived server-authorized URLs.
 */
export const VERIFICATION_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;
export type VerificationRequestStatus = (typeof VERIFICATION_REQUEST_STATUSES)[number];

export const VERIFICATION_TYPES = ["selfieId", "idOnly"] as const;
export type VerificationType = (typeof VERIFICATION_TYPES)[number];

export interface VerificationRequest {
  id: string;
  uid: string;
  type: VerificationType;
  status: VerificationRequestStatus;
  reason: string | null;
  createdAt: string;
}

/** Whether the member may (re)submit: no request yet, or the last was rejected. */
export function canSubmitVerification(request: VerificationRequest | null): boolean {
  return request === null || request.status === "rejected";
}
