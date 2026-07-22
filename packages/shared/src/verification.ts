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

/** Staff decisions on a pending verification request (master spec F3, CF5). */
export const VERIFICATION_DECISIONS = ["approve", "reject"] as const;
export type VerificationDecision = (typeof VERIFICATION_DECISIONS)[number];

export type VerificationDecisionCheck =
  { ok: true } | { ok: false; reason: "notStaff" | "notPending" };

/** Only staff may decide, and only while the request is `pending` (CF5 enforces
 * this in a transaction; decisions are server-only). */
export function canDecideVerification(
  request: Pick<VerificationRequest, "status">,
  actorIsStaff: boolean,
): VerificationDecisionCheck {
  if (!actorIsStaff) return { ok: false, reason: "notStaff" };
  if (request.status !== "pending") return { ok: false, reason: "notPending" };
  return { ok: true };
}

/** The resulting request status + mirrored profile verification for a decision. */
export function verificationOutcome(decision: VerificationDecision): {
  requestStatus: VerificationRequestStatus;
  profileStatus: "verified" | "rejected";
} {
  return decision === "approve"
    ? { requestStatus: "approved", profileStatus: "verified" }
    : { requestStatus: "rejected", profileStatus: "rejected" };
}
