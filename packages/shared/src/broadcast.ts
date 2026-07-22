import { z } from "zod";
import { type LocalizedText } from "./compatibility";
import { type Gender } from "./profile";
import { isAdminRole, type Role } from "./role";
import { type AccountStatus } from "./user-admin";

/**
 * Broadcast domain (master spec Section 6.3, F10). Staff compose a localized
 * message to an allow-listed audience, dry-run the audience (who would receive
 * it) before sending, then a Cloud Function sends it in batches idempotently
 * and records a delivery summary. Broadcasts are admin-only and server-only to
 * write; the console reads them. These pure helpers gate, validate, and
 * estimate the audience so client preflight and server enforcement agree.
 */
export const BROADCAST_AUDIENCES = ["all", "verified", "unverified", "male", "female"] as const;
export type BroadcastAudience = (typeof BROADCAST_AUDIENCES)[number];

export const BROADCAST_STATUSES = ["draft", "sending", "sent", "failed"] as const;
export type BroadcastStatus = (typeof BROADCAST_STATUSES)[number];

export const BROADCAST_TITLE_MAX = 80;
export const BROADCAST_BODY_MAX = 600;

export interface Broadcast {
  id: string;
  audience: BroadcastAudience;
  title: LocalizedText;
  body: LocalizedText;
  status: BroadcastStatus;
  targetedCount: number;
  sentCount: number;
  failedCount: number;
  createdBy: string;
  createdAt: string;
  sentAt: string | null;
}

/** The minimal member projection the audience filter needs (dry run). */
export interface AudienceMember {
  uid: string;
  status: AccountStatus;
  verified: boolean;
  gender: Gender;
}

const localizedBounded = (max: number) =>
  z.object({
    ar: z.string().trim().min(1).max(max),
    en: z.string().trim().min(1).max(max),
    tr: z.string().trim().min(1).max(max),
  });

export const broadcastInputSchema = z.object({
  audience: z.enum(BROADCAST_AUDIENCES),
  title: localizedBounded(BROADCAST_TITLE_MAX),
  body: localizedBounded(BROADCAST_BODY_MAX),
});
export type BroadcastInput = z.infer<typeof broadcastInputSchema>;

/** Broadcasting is a high-impact action — admin+ only. */
export function canSendBroadcast(role: Role): boolean {
  return isAdminRole(role);
}

/**
 * Whether a member would receive a broadcast for the given audience. Suspended
 * and banned members never receive one, regardless of audience.
 */
export function matchesAudience(member: AudienceMember, audience: BroadcastAudience): boolean {
  if (member.status !== "active") return false;
  switch (audience) {
    case "all":
      return true;
    case "verified":
      return member.verified;
    case "unverified":
      return !member.verified;
    case "male":
      return member.gender === "male";
    case "female":
      return member.gender === "female";
  }
}

/** Dry-run count: how many of `members` match the audience. */
export function estimateAudience(
  members: readonly AudienceMember[],
  audience: BroadcastAudience,
): number {
  return members.reduce((n, m) => (matchesAudience(m, audience) ? n + 1 : n), 0);
}

/**
 * Idempotency guard: a broadcast may be dispatched only from `draft` (first
 * send) or `failed` (retry). `sending`/`sent` are terminal for dispatch, so a
 * duplicate send is refused.
 */
export function canDispatch(status: BroadcastStatus): boolean {
  return status === "draft" || status === "failed";
}
