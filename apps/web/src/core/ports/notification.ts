import type { AppNotification } from "@nisfi/shared";

/**
 * NotificationService port (master spec Sections 5.2, F6, 10.8). Notifications
 * are created by Cloud Functions; the owner reads them and may flip `read`.
 */
export interface NotificationService {
  list(uid: string): Promise<AppNotification[]>;
  markRead(uid: string, id: string): Promise<void>;
}
