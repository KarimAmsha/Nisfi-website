import type { MemberPreferences } from "./member-settings";
import type { Entitlement } from "./plans";
import type { AccountStatus } from "./user-admin";

/**
 * Privacy rights (master spec Section 7 / F11): member self-service data export
 * and account deletion. Export bundles only the member's OWN data (never
 * another member's). Deletion anonymizes the profile, closes matches (the
 * counterpart sees "member left"), removes tokens/notifications, and sets
 * `users.status = "deleted"` — irreversible. These pure helpers assemble the
 * export and describe the anonymization so client and server agree.
 */
export interface MemberExport {
  exportedAt: string;
  uid: string;
  profile: Record<string, unknown>;
  preferences: MemberPreferences;
  entitlement: Entitlement | null;
}

/** Assemble a privacy-safe export of the member's own data. */
export function assembleMemberExport(input: {
  uid: string;
  profile: Record<string, unknown>;
  preferences: MemberPreferences;
  entitlement: Entitlement | null;
  exportedAt?: string;
}): MemberExport {
  return {
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    uid: input.uid,
    profile: input.profile,
    preferences: input.preferences,
    entitlement: input.entitlement,
  };
}

/** The anonymized display name a deleted member's profile shows to counterparts. */
export const ANONYMIZED_DISPLAY_NAME = "Deleted member";

/** The public-profile patch applied on deletion (clears personal content). */
export interface DeletionAnonymization {
  displayName: string;
  about: string;
  answers: Record<string, never>;
  visibility: "hidden";
  photosCleared: true;
}

export function buildDeletionAnonymization(): DeletionAnonymization {
  return {
    displayName: ANONYMIZED_DISPLAY_NAME,
    about: "",
    answers: {},
    visibility: "hidden",
    photosCleared: true,
  };
}

/** A member may request deletion unless the account is already deleted. */
export function canRequestDeletion(status: AccountStatus): boolean {
  return status !== "deleted";
}
