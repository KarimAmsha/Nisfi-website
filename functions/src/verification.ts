import {
  canDecideVerification,
  verificationOutcome,
  type VerificationDecision,
  type VerificationDecisionCheck,
  type VerificationRequest,
} from "@nisfi/shared";

/**
 * CF5 `decideVerification` core (master spec Sections F3, 12). A staff member
 * approves/rejects a pending request; the deployed callable runs this in a
 * transaction, then writes the request status, mirrors the result to
 * `profiles.verification`, notifies the member, and appends an audit log — all
 * server-only. SDK-free and unit-testable; Admin SDK + Cloudinary staff-URL
 * signing are deferred (O-001/O-002).
 */
export type DecideVerificationResult =
  | {
      ok: true;
      requestUpdate: { status: "approved" | "rejected"; reason: string | null; decidedBy: string };
      profileVerification: "verified" | "rejected";
      notificationKey: "verificationApproved" | "verificationRejected";
    }
  | (VerificationDecisionCheck & { ok: false });

export function evaluateVerificationDecision(
  request: Pick<VerificationRequest, "status">,
  actor: { uid: string; isStaff: boolean },
  decision: VerificationDecision,
  reason?: string,
): DecideVerificationResult {
  const check = canDecideVerification(request, actor.isStaff);
  if (!check.ok) return check;
  const outcome = verificationOutcome(decision);
  return {
    ok: true,
    requestUpdate: {
      status: outcome.requestStatus === "approved" ? "approved" : "rejected",
      reason: decision === "reject" ? (reason ?? null) : null,
      decidedBy: actor.uid,
    },
    profileVerification: outcome.profileStatus,
    notificationKey: decision === "approve" ? "verificationApproved" : "verificationRejected",
  };
}
