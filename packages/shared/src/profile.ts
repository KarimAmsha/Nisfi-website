import { z } from "zod";
import { LOCALES } from "./locale";

/**
 * Profile domain schemas (master spec Section 10.2), shared between the web app
 * and Cloud Functions. The public profile holds member-facing, owner-editable
 * fields; sensitive/system/moderation fields are server-managed and split out.
 * This is the Unit 2.1 foundation; onboarding units (2.2–2.3) extend it.
 */
export const GENDERS = ["male", "female"] as const;
export const MARITAL_STATUSES = ["single", "divorced", "widowed"] as const;
export const CHILDREN_STATUSES = ["none", "have", "preferNotToSay"] as const;
export const RELIGIOUSNESS = ["practicing", "moderate", "learning", "preferNotToSay"] as const;
export const MARRIAGE_TIMELINES = ["withinYear", "oneToTwoYears", "notSure"] as const;
export const PROFILE_VISIBILITY = ["visible", "hidden"] as const;
export const VERIFICATION_STATUSES = ["unverified", "pending", "verified", "rejected"] as const;

export type Gender = (typeof GENDERS)[number];
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

/** Owner-editable public profile fields. */
export const editableProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(40),
  gender: z.enum(GENDERS),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD"),
  country: z.string().trim().min(2).max(56),
  city: z.string().trim().min(1).max(85),
  about: z.string().trim().max(600).optional(),
  maritalStatus: z.enum(MARITAL_STATUSES),
  children: z.enum(CHILDREN_STATUSES),
  religiousness: z.enum(RELIGIOUSNESS),
  education: z.string().trim().max(120).optional(),
  occupation: z.string().trim().max(120).optional(),
  marriageTimeline: z.enum(MARRIAGE_TIMELINES),
  languages: z.array(z.enum(LOCALES)).min(1).max(3),
  visibility: z.enum(PROFILE_VISIBILITY),
  /** Compatibility answers: questionId -> optionId (master spec Section 10.9). */
  answers: z.record(z.string(), z.string()).optional(),
});
export type EditableProfile = z.infer<typeof editableProfileSchema>;

/** The exact set of client-writable public-profile keys (used by security rules
 * and repository writes). Keep in sync with `firestore.rules`. */
export const EDITABLE_PROFILE_KEYS = Object.keys(
  editableProfileSchema.shape,
) as (keyof EditableProfile)[];

/** Stored public profile = editable fields + server-managed system fields. */
export type PublicProfile = EditableProfile & {
  uid: string;
  verificationStatus: VerificationStatus;
  createdAt: string;
  updatedAt: string;
};

/** Private, sensitive profile data (owner + authorized staff only). */
export const privateProfileSchema = z.object({
  phoneNumber: z.string().trim().max(20).optional(),
  contactNote: z.string().trim().max(300).optional(),
});
export type PrivateProfile = z.infer<typeof privateProfileSchema>;
