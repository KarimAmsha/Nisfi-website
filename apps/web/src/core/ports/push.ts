import type { PushPermission } from "@nisfi/shared";

/**
 * PushService port (master spec Sections 5.2, F9). Web push permission is
 * requested only on an explicit user action (never on load). Enabling requests
 * permission, obtains an FCM token, and stores it as a private per-device doc;
 * disabling removes the device. Tokens are pruned server-side on invalid-token
 * errors.
 */
export interface PushService {
  isSupported(): boolean;
  currentPermission(): PushPermission;
  enable(uid: string): Promise<PushPermission>;
  disable(uid: string): Promise<void>;
}
