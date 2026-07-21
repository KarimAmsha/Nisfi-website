import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
  type DocumentData,
} from "firebase/firestore";
import type {
  VerificationRequest,
  VerificationRequestStatus,
  VerificationType,
} from "@nisfi/shared";
import type { VerificationRepository } from "@/core/ports/verification";
import { firebaseFirestore } from "./client";

function tsToIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();
}

function toRequest(id: string, data: DocumentData): VerificationRequest {
  return {
    id,
    uid: data.uid as string,
    type: data.type as VerificationType,
    status: (data.status as VerificationRequestStatus | undefined) ?? "pending",
    reason: (data.reason as string | null | undefined) ?? null,
    createdAt: tsToIso(data.createdAt),
  };
}

class FirestoreVerificationRepository implements VerificationRepository {
  async getOwn(uid: string): Promise<VerificationRequest | null> {
    // Equality-only query (auto single-field index) — pick the latest client-side.
    const snap = await getDocs(
      query(collection(firebaseFirestore(), "verificationRequests"), where("uid", "==", uid)),
    );
    const requests = snap.docs.map((d) => toRequest(d.id, d.data()));
    requests.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return requests[0] ?? null;
  }

  async submit(uid: string, type: VerificationType): Promise<VerificationRequest> {
    const ref = await addDoc(collection(firebaseFirestore(), "verificationRequests"), {
      uid,
      type,
      status: "pending",
      reason: null,
      createdAt: serverTimestamp(),
    });
    return {
      id: ref.id,
      uid,
      type,
      status: "pending",
      reason: null,
      createdAt: new Date().toISOString(),
    };
  }
}

export const verificationRepository: VerificationRepository = new FirestoreVerificationRepository();
