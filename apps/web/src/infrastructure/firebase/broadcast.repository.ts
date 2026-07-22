import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type {
  Broadcast,
  BroadcastAudience,
  BroadcastInput,
  BroadcastStatus,
  LocalizedText,
} from "@nisfi/shared";
import type { BroadcastRepository } from "@/core/ports/broadcast";
import { firebaseFirestore, firebaseFunctions } from "./client";

const emptyText: LocalizedText = { ar: "", en: "", tr: "" };

function toBroadcast(id: string, data: DocumentData): Broadcast {
  return {
    id,
    audience: (data.audience as BroadcastAudience | undefined) ?? "all",
    title: (data.title as LocalizedText | undefined) ?? emptyText,
    body: (data.body as LocalizedText | undefined) ?? emptyText,
    status: (data.status as BroadcastStatus | undefined) ?? "draft",
    targetedCount: (data.targetedCount as number | undefined) ?? 0,
    sentCount: (data.sentCount as number | undefined) ?? 0,
    failedCount: (data.failedCount as number | undefined) ?? 0,
    createdBy: (data.createdBy as string | undefined) ?? "",
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : new Date(0).toISOString(),
    sentAt: data.sentAt instanceof Timestamp ? data.sentAt.toDate().toISOString() : null,
  };
}

class FirestoreBroadcastRepository implements BroadcastRepository {
  async listBroadcasts(): Promise<Broadcast[]> {
    const snap = await getDocs(
      query(collection(firebaseFirestore(), "broadcasts"), orderBy("createdAt", "desc"), limit(20)),
    );
    return snap.docs.map((d) => toBroadcast(d.id, d.data()));
  }

  async estimateAudience(audience: BroadcastAudience): Promise<number> {
    const callable = httpsCallable<{ audience: BroadcastAudience }, { count: number }>(
      firebaseFunctions(),
      "estimateBroadcastAudience",
    );
    const res = await callable({ audience });
    return res.data.count;
  }

  async sendBroadcast(input: BroadcastInput): Promise<void> {
    const callable = httpsCallable<{ input: BroadcastInput }, void>(
      firebaseFunctions(),
      "sendBroadcast",
    );
    await callable({ input });
  }
}

export const broadcastRepository: BroadcastRepository = new FirestoreBroadcastRepository();
