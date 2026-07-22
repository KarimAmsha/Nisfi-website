import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
  type DocumentData,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type { Match, MatchCloseReason, MatchParticipant, MatchStatus } from "@nisfi/shared";
import type { MatchRepository } from "@/core/ports/match";
import { firebaseFirestore, firebaseFunctions } from "./client";

function tsToIso(value: unknown): string | null {
  return value instanceof Timestamp ? value.toDate().toISOString() : null;
}

function toMatch(id: string, data: DocumentData): Match {
  const uids = (data.uids as string[] | undefined) ?? [];
  return {
    pairKey: id,
    uids: [uids[0] ?? "", uids[1] ?? ""],
    participants: (data.participants as Record<string, MatchParticipant> | undefined) ?? {},
    status: (data.status as MatchStatus | undefined) ?? "active",
    closedBy: (data.closedBy as string | null | undefined) ?? null,
    closedReason: (data.closedReason as MatchCloseReason | null | undefined) ?? null,
    photoReveal: (data.photoReveal as Record<string, boolean> | undefined) ?? {},
    lastMessageAt: tsToIso(data.lastMessageAt),
    lastMessagePreview: (data.lastMessagePreview as string | null | undefined) ?? null,
    unread: (data.unread as Record<string, number> | undefined) ?? {},
    requestId: (data.requestId as string | undefined) ?? "",
    createdAt: tsToIso(data.createdAt) ?? new Date(0).toISOString(),
  };
}

class FirestoreMatchRepository implements MatchRepository {
  async listMatches(uid: string): Promise<Match[]> {
    // Matches the `matches` composite index (uids CONTAINS, status ASC,
    // lastMessageAt DESC). Closed-match history is surfaced with the close flow
    // (Unit 4.3).
    const snap = await getDocs(
      query(
        collection(firebaseFirestore(), "matches"),
        where("uids", "array-contains", uid),
        where("status", "==", "active"),
        orderBy("lastMessageAt", "desc"),
      ),
    );
    return snap.docs.map((d) => toMatch(d.id, d.data()));
  }

  async getMatch(pairKey: string): Promise<Match | null> {
    const snap = await getDoc(doc(firebaseFirestore(), "matches", pairKey));
    return snap.exists() ? toMatch(snap.id, snap.data()) : null;
  }

  async close(pairKey: string): Promise<void> {
    const callable = httpsCallable<{ pairKey: string }, void>(firebaseFunctions(), "closeMatch");
    await callable({ pairKey });
  }
}

export const matchRepository: MatchRepository = new FirestoreMatchRepository();
