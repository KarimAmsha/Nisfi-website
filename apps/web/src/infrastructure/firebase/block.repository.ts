import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type { Block } from "@nisfi/shared";
import type { BlockRepository } from "@/core/ports/block";
import { firebaseFirestore, firebaseFunctions } from "./client";

function tsToIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date(0).toISOString();
}

class FirestoreBlockRepository implements BlockRepository {
  async block(targetUid: string): Promise<void> {
    const callable = httpsCallable<{ targetUid: string }, void>(firebaseFunctions(), "blockUser");
    await callable({ targetUid });
  }

  async unblock(targetUid: string): Promise<void> {
    const callable = httpsCallable<{ targetUid: string }, void>(firebaseFunctions(), "unblockUser");
    await callable({ targetUid });
  }

  async listBlocked(uid: string): Promise<Block[]> {
    const snap = await getDocs(
      query(
        collection(firebaseFirestore(), "blocks", uid, "blocked"),
        orderBy("createdAt", "desc"),
      ),
    );
    return snap.docs.map((d) => {
      const data = d.data();
      return { targetUid: d.id, createdAt: tsToIso(data.createdAt) };
    });
  }
}

export const blockRepository: BlockRepository = new FirestoreBlockRepository();
