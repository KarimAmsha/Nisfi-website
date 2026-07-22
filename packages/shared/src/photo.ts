/**
 * Photo domain types (master spec Sections 10.14, 11.3, F7). Storage runs on a
 * free image platform (Cloudinary, owner decision O-002): originals are private
 * (never publicly readable), the public view is an on-the-fly blurred/protected
 * derivative, and reveal uses short-lived signed URLs. Moderation is server-
 * driven; new uploads start `pending`.
 */
export const PHOTO_MODERATION = ["pending", "approved", "rejected"] as const;
export type PhotoModeration = (typeof PHOTO_MODERATION)[number];

export interface Photo {
  id: string;
  order: number;
  moderation: PhotoModeration;
  /** Owner-only preview of the original (owners may see their own photos). */
  ownerPreviewUrl: string | null;
  createdAt: string;
}

export const MAX_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type PhotoValidationError = "type" | "size" | "limit";

/** Client-side pre-upload validation (server re-validates bytes — never trust
 * the client MIME/size alone). */
export function validatePhotoFile(
  file: { type: string; size: number },
  currentCount: number,
): PhotoValidationError | null {
  if (currentCount >= MAX_PHOTOS) return "limit";
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) return "type";
  if (file.size > MAX_PHOTO_BYTES) return "size";
  return null;
}

/** Staff decisions on a pending photo (master spec F8). On approve the blurred
 * variant becomes publicly readable; on reject it is never published. */
export const PHOTO_DECISIONS = ["approve", "reject"] as const;
export type PhotoDecision = (typeof PHOTO_DECISIONS)[number];

export type PhotoDecisionCheck = { ok: true } | { ok: false; reason: "notStaff" | "notPending" };

export function canDecidePhoto(
  photo: Pick<Photo, "moderation">,
  actorIsStaff: boolean,
): PhotoDecisionCheck {
  if (!actorIsStaff) return { ok: false, reason: "notStaff" };
  if (photo.moderation !== "pending") return { ok: false, reason: "notPending" };
  return { ok: true };
}

/** The moderation state a decision produces. */
export function photoModerationOutcome(decision: PhotoDecision): PhotoModeration {
  return decision === "approve" ? "approved" : "rejected";
}
