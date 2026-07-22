import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
  type DocumentData,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { makePairKey, type ConnectionRequest, type ConnectionRequestStatus } from "@nisfi/shared";
import type {
  ConnectionRequestRepository,
  RespondAction,
  SendRequestInput,
} from "@/core/ports/connection-request";
import { firebaseFirestore, firebaseFunctions } from "./client";

function tsToIso(value: unknown): string | null {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

function toRequest(id: string, data: DocumentData): ConnectionRequest {
  return {
    id,
    pairKey: data.pairKey as string,
    fromUid: data.fromUid as string,
    toUid: data.toUid as string,
    message: (data.message as string | undefined) ?? "",
    status: (data.status as ConnectionRequestStatus | undefined) ?? "pending",
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
    respondedAt: tsToIso(data.respondedAt),
  };
}

class FirestoreConnectionRequestRepository implements ConnectionRequestRepository {
  async send(input: SendRequestInput): Promise<ConnectionRequest> {
    // Writes are server-only: CF6 validates and creates the request in one
    // transaction (client writes to `connectionRequests` are denied by rules).
    const callable = httpsCallable<SendRequestInput, ConnectionRequest>(
      firebaseFunctions(),
      "sendConnectionRequest",
    );
    const result = await callable(input);
    return result.data;
  }

  async countPendingSent(uid: string): Promise<number> {
    const snap = await getCountFromServer(
      query(
        collection(firebaseFirestore(), "connectionRequests"),
        where("fromUid", "==", uid),
        where("status", "==", "pending"),
      ),
    );
    return snap.data().count;
  }

  async getLatestForPair(pairKeyOrA: string, b?: string): Promise<ConnectionRequest | null> {
    const pairKey = b ? makePairKey(pairKeyOrA, b) : pairKeyOrA;
    const snap = await getDocs(
      query(
        collection(firebaseFirestore(), "connectionRequests"),
        where("pairKey", "==", pairKey),
        orderBy("createdAt", "desc"),
        limit(1),
      ),
    );
    const first = snap.docs[0];
    return first ? toRequest(first.id, first.data()) : null;
  }

  private async listBy(field: "toUid" | "fromUid", uid: string): Promise<ConnectionRequest[]> {
    const snap = await getDocs(
      query(
        collection(firebaseFirestore(), "connectionRequests"),
        where(field, "==", uid),
        orderBy("createdAt", "desc"),
      ),
    );
    return snap.docs.map((d) => toRequest(d.id, d.data()));
  }

  listReceived(uid: string): Promise<ConnectionRequest[]> {
    return this.listBy("toUid", uid);
  }

  listSent(uid: string): Promise<ConnectionRequest[]> {
    return this.listBy("fromUid", uid);
  }

  async respond(id: string, action: RespondAction, reason?: string): Promise<void> {
    const callable = httpsCallable<{ id: string; action: RespondAction; reason?: string }, void>(
      firebaseFunctions(),
      "respondToConnectionRequest",
    );
    await callable(reason !== undefined ? { id, action, reason } : { id, action });
  }

  async withdraw(id: string): Promise<void> {
    const callable = httpsCallable<{ id: string }, void>(
      firebaseFunctions(),
      "withdrawConnectionRequest",
    );
    await callable({ id });
  }
}

export const connectionRequestRepository: ConnectionRequestRepository =
  new FirestoreConnectionRequestRepository();
