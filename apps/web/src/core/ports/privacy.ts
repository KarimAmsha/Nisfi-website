import type { MemberExport } from "@nisfi/shared";

/**
 * PrivacyRepository port (master spec Section 7 / F11). Member self-service
 * data export and account deletion, both handled server-side (Cloud Functions):
 * export returns a privacy-safe bundle of the member's own data; deletion is
 * self-only and irreversible (anonymize, close matches, remove tokens, set
 * `users.status = "deleted"`). Clients never perform the cascade directly.
 */
export interface PrivacyRepository {
  exportMyData(uid: string): Promise<MemberExport>;
  deleteMyAccount(uid: string): Promise<void>;
}
