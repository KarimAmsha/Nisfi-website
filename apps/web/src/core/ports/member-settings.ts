import type { Locale, MemberPreferences } from "@nisfi/shared";

/** The owner-writable account settings stored on the `users` document. */
export interface MemberSettings {
  locale: Locale | null;
  preferences: MemberPreferences;
}

/**
 * MemberSettingsRepository port (master spec Section 7). Reads/writes the
 * owner-editable `users.locale` and `users.preferences` (the security rules
 * allow exactly those fields for the owner). Account data export and deletion
 * are privacy-rights actions handled server-side (Cloud Functions), never a
 * direct client write.
 */
export interface MemberSettingsRepository {
  getSettings(uid: string): Promise<MemberSettings>;
  savePreferences(uid: string, preferences: MemberPreferences): Promise<void>;
  saveLocale(uid: string, locale: Locale): Promise<void>;
  /** Request a privacy-safe export of the member's own data (server-side). */
  requestDataExport(uid: string): Promise<void>;
  /** Request account deletion (server-side; verification + grace handled there). */
  requestAccountDeletion(uid: string): Promise<void>;
}
