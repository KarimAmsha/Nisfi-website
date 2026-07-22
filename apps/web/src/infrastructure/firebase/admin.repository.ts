import { collection, getCountFromServer, query, where } from "firebase/firestore";
import type { AdminQueueCounts, AdminRepository } from "@/core/ports/admin";
import { firebaseFirestore } from "./client";

/**
 * Firestore AdminRepository — staff-scoped aggregate reads. `verificationRequests`
 * are staff-readable (Unit 2.5 rules); the photo-moderation and reports queues
 * become readable with their units (5.2/5.3), so they count 0 until then rather
 * than guessing.
 */
class FirestoreAdminRepository implements AdminRepository {
  async getQueueCounts(): Promise<AdminQueueCounts> {
    const pendingVerifications = await getCountFromServer(
      query(
        collection(firebaseFirestore(), "verificationRequests"),
        where("status", "==", "pending"),
      ),
    );
    return {
      pendingVerifications: pendingVerifications.data().count,
      pendingPhotos: 0,
      openReports: 0,
    };
  }
}

export const adminRepository: AdminRepository = new FirestoreAdminRepository();
