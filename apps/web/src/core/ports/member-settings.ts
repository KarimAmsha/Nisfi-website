import type { Locale, MemberPreferences } from "@nisfi/shared";

/** The owner-writable account settings stored on the `users` document. */
export interface MemberSettings {
  locale: Locale | null;
  preferences: MemberPreferences;
}

/**
 * MemberSettingsRepository port (master spec Section 7). Reads/writes the
 * owner-editable `users.locale` and `users.preferences` (the security rules
 * allow exactly those fields for the owner). Data export and account deletion
 * are separate privacy-rights actions on `PrivacyRepository`.
 */
export interface MemberSettingsRepository {
  getSettings(uid: string): Promise<MemberSettings>;
  savePreferences(uid: string, preferences: MemberPreferences): Promise<void>;
  saveLocale(uid: string, locale: Locale): Promise<void>;
}
