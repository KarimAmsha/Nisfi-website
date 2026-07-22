import {
  collection,
  getCountFromServer,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
  type DocumentData,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type {
  VerificationDecision,
  VerificationRequest,
  VerificationRequestStatus,
  VerificationType,
} from "@nisfi/shared";
import type { AdminQueueCounts, AdminRepository } from "@/core/ports/admin";
import { firebaseFirestore, firebaseFunctions } from "./client";

function tsToIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();
}

function toRequest(id: string, data: DocumentData): VerificationRequest {
  return {
    id,
    uid: data.uid as string,
    type: (data.type as VerificationType | undefined) ?? "selfieId",
    status: (data.status as VerificationRequestStatus | undefined) ?? "pending",
    reason: (data.reason as string | null | undefined) ?? null,
    createdAt: tsToIso(data.createdAt),
  };
}

/**
 * Firestore AdminRepository — staff-scoped aggregate + queue reads and CF-backed
 * decisions. `verificationRequests` are staff-readable (Unit 2.5 rules); the
 * photo-moderation and reports queues become readable with their units
 * (5.2/5.3), so they count 0 until then rather than guessing.
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

  async listVerificationQueue(): Promise<VerificationRequest[]> {
    // Matches the verificationRequests composite index (status ASC, createdAt ASC).
    const snap = await getDocs(
      query(
        collection(firebaseFirestore(), "verificationRequests"),
        where("status", "==", "pending"),
        orderBy("createdAt", "asc"),
      ),
    );
    return snap.docs.map((d) => toRequest(d.id, d.data()));
  }

  async decideVerification(
    id: string,
    decision: VerificationDecision,
    reason?: string,
  ): Promise<void> {
    const callable = httpsCallable<
      { id: string; decision: VerificationDecision; reason?: string },
      void
    >(firebaseFunctions(), "decideVerification");
    await callable(reason !== undefined ? { id, decision, reason } : { id, decision });
  }
}

export const adminRepository: AdminRepository = new FirestoreAdminRepository();
