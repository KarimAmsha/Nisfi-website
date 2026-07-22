import {
  assembleMemberExport,
  buildDeletionAnonymization,
  canRequestDeletion,
  type AccountStatus,
  type DeletionAnonymization,
  type Entitlement,
  type MemberExport,
  type MemberPreferences,
} from "@nisfi/shared";

/**
 * Privacy-rights Cloud Function cores (master spec Section 7, F11): member
 * self-service export and account deletion. Export bundles only the requester's
 * own data. Deletion is self-only and irreversible — the deployed callable runs
 * the returned plan in a transaction (anonymize profile, close matches, remove
 * tokens/notifications, disable auth, set `users.status = "deleted"`) and
 * appends an audit event. SDK-free and unit-testable; Admin SDK + Cloudinary
 * wiring are deferred (O-001/O-002).
 */
export function buildMemberExport(input: {
  uid: string;
  profile: Record<string, unknown>;
  preferences: MemberPreferences;
  entitlement: Entitlement | null;
}): MemberExport {
  return assembleMemberExport(input);
}

export type AccountDeletionResult =
  | {
      ok: true;
      usersUpdate: { status: "deleted" };
      profileAnonymization: DeletionAnonymization;
      closeMatches: { closedReason: "deletion" };
      removeTokens: true;
      removeNotifications: true;
      disableAuth: true;
    }
  | { ok: false; reason: "notSelf" | "alreadyDeleted" };

export function evaluateAccountDeletion(
  actorUid: string,
  target: { uid: string; status: AccountStatus },
): AccountDeletionResult {
  if (actorUid !== target.uid) return { ok: false, reason: "notSelf" };
  if (!canRequestDeletion(target.status)) return { ok: false, reason: "alreadyDeleted" };
  return {
    ok: true,
    usersUpdate: { status: "deleted" },
    profileAnonymization: buildDeletionAnonymization(),
    closeMatches: { closedReason: "deletion" },
    removeTokens: true,
    removeNotifications: true,
    disableAuth: true,
  };
}
