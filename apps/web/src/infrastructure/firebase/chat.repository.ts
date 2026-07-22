import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import type { ChatMessage } from "@nisfi/shared";
import type { ChatRepository, SendMessageInput } from "@/core/ports/chat";
import { firebaseFirestore } from "./client";

function tsToIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();
}

function toMessage(id: string, data: DocumentData): ChatMessage {
  const moderation = (data.moderation ?? {}) as { flagged?: boolean };
  return {
    id,
    senderUid: (data.senderUid as string | undefined) ?? "",
    text: (data.text as string | undefined) ?? "",
    deleted: Boolean(data.deleted),
    moderation: { flagged: Boolean(moderation.flagged) },
    createdAt: tsToIso(data.createdAt),
  };
}

class FirestoreChatRepository implements ChatRepository {
  listen(matchId: string, onChange: (messages: ChatMessage[]) => void): () => void {
    return onSnapshot(
      query(
        collection(firebaseFirestore(), "matches", matchId, "messages"),
        orderBy("createdAt", "asc"),
      ),
      (snap) => onChange(snap.docs.map((d) => toMessage(d.id, d.data()))),
    );
  }

  async send(input: SendMessageInput): Promise<void> {
    // The exact message schema the rules allow; the server re-checks banned
    // words and sets moderation.flagged authoritatively.
    await addDoc(collection(firebaseFirestore(), "matches", input.matchId, "messages"), {
      senderUid: input.senderUid,
      text: input.text,
      deleted: false,
      moderation: { flagged: false },
      createdAt: serverTimestamp(),
    });
  }

  async softDelete(matchId: string, messageId: string): Promise<void> {
    await updateDoc(doc(firebaseFirestore(), "matches", matchId, "messages", messageId), {
      deleted: true,
    });
  }
}

export const chatRepository: ChatRepository = new FirestoreChatRepository();
