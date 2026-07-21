import type { EditableProfile, PrivateProfile, PublicProfile } from "@nisfi/shared";

/**
 * ProfileRepository port (master spec Section 5.2). Exposes domain types only;
 * the Firebase adapter converts Firestore `Timestamp`s to ISO strings at the
 * boundary. Product code depends on this interface, not the Firestore SDK.
 */
export interface ProfileRepository {
  /** The signed-in user's own public profile (owner read). */
  getOwn(uid: string): Promise<PublicProfile | null>;
  /** Another member's public profile, subject to security rules. */
  getPublic(uid: string): Promise<PublicProfile | null>;
  /** Create or update owner-editable public fields (a subset is allowed, e.g.
   * resumable onboarding). */
  saveOwn(uid: string, data: Partial<EditableProfile>): Promise<void>;
  /** The owner's private, sensitive profile data. */
  getPrivate(uid: string): Promise<PrivateProfile | null>;
  savePrivate(uid: string, data: PrivateProfile): Promise<void>;
}
