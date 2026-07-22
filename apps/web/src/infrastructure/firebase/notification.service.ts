import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import type { AppNotification } from "@nisfi/shared";
import type { NotificationService } from "@/core/ports/notification";
import { firebaseFirestore } from "./client";

function tsToIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();
}

function toNotification(id: string, data: DocumentData): AppNotification {
  return {
    id,
    type: (data.type as string | undefined) ?? "requestReceived",
    titleKey: (data.titleKey as string | undefined) ?? "",
    bodyKey: (data.bodyKey as string | undefined) ?? "",
    params: (data.params as Record<string, string> | undefined) ?? {},
    link: (data.link as string | null | undefined) ?? null,
    read: Boolean(data.read),
    createdAt: tsToIso(data.createdAt),
  };
}

class FirestoreNotificationService implements NotificationService {
  async list(uid: string): Promise<AppNotification[]> {
    const snap = await getDocs(
      query(
        collection(firebaseFirestore(), "notifications", uid, "items"),
        orderBy("createdAt", "desc"),
      ),
    );
    return snap.docs.map((d) => toNotification(d.id, d.data()));
  }

  async markRead(uid: string, id: string): Promise<void> {
    // Rules allow the owner to change only the `read` field.
    await updateDoc(doc(firebaseFirestore(), "notifications", uid, "items", id), { read: true });
  }
}

export const notificationService: NotificationService = new FirestoreNotificationService();
