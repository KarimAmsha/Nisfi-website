import type { PushPermission } from "@nisfi/shared";
import type { PushService } from "@/core/ports/push";

/**
 * Firebase Cloud Messaging adapter (master spec F9). Enabling requests the
 * browser Notification permission on the user's action, then registers an FCM
 * token as a private device doc under `users/{uid}/devices/{deviceId}`. Getting
 * the token needs the VAPID key + a service worker; that final wiring is
 * deferred (O-001), so token registration is a no-op until then — but the
 * permission flow is real and never triggered on load.
 */
class FcmPushService implements PushService {
  isSupported(): boolean {
    return typeof window !== "undefined" && "Notification" in window;
  }

  currentPermission(): PushPermission {
    if (!this.isSupported()) return "unsupported";
    return Notification.permission;
  }

  async enable(_uid: string): Promise<PushPermission> {
    if (!this.isSupported()) return "unsupported";
    const result = await Notification.requestPermission();
    // Token registration (getToken with VAPID + SW, then write the device doc)
    // is wired in the production step (O-001). Permission itself is now set.
    return result;
  }

  async disable(_uid: string): Promise<void> {
    // Deleting the FCM token + the device doc is wired with the token lifecycle
    // in the production step (O-001).
  }
}

export const pushService: PushService = new FcmPushService();
