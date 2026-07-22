import {
  collection,
  collectionGroup,
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
  AccountStatus,
  AdminUser,
  PhotoDecision,
  PhotoModeration,
  Report,
  ReportReason,
  ReportStatus,
  ReportTargetType,
  Role,
  Sanction,
  UserFilter,
  VerificationDecision,
  VerificationRequest,
  VerificationRequestStatus,
  VerificationType,
} from "@nisfi/shared";
import { matchesUserFilter } from "@nisfi/shared";
import type { AdminQueueCounts, AdminRepository, PhotoQueueItem } from "@/core/ports/admin";
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
    const [pendingVerifications, openReports] = await Promise.all([
      getCountFromServer(
        query(
          collection(firebaseFirestore(), "verificationRequests"),
          where("status", "==", "pending"),
        ),
      ),
      getCountFromServer(
        query(collection(firebaseFirestore(), "reports"), where("status", "==", "open")),
      ),
    ]);
    return {
      pendingVerifications: pendingVerifications.data().count,
      pendingPhotos: 0,
      openReports: openReports.data().count,
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

  async listPhotoQueue(): Promise<PhotoQueueItem[]> {
    // Photos live under `profiles/{uid}/photos/{id}`; a collection-group query
    // gathers pending photos across members (needs a `photos` collection-group
    // index + storage rules, wired with Cloudinary — O-002).
    const snap = await getDocs(
      query(
        collectionGroup(firebaseFirestore(), "photos"),
        where("moderation", "==", "pending"),
        orderBy("createdAt", "asc"),
      ),
    );
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: d.ref.parent.parent?.id ?? "",
        order: (data.order as number | undefined) ?? 0,
        moderation: (data.moderation as PhotoModeration | undefined) ?? "pending",
        ownerPreviewUrl: null,
        createdAt: tsToIso(data.createdAt),
      };
    });
  }

  async decidePhoto(
    uid: string,
    photoId: string,
    decision: PhotoDecision,
    reason?: string,
  ): Promise<void> {
    const callable = httpsCallable<
      { uid: string; photoId: string; decision: PhotoDecision; reason?: string },
      void
    >(firebaseFunctions(), "decidePhoto");
    await callable(
      reason !== undefined ? { uid, photoId, decision, reason } : { uid, photoId, decision },
    );
  }

  async listReports(status: ReportStatus = "open"): Promise<Report[]> {
    // Matches the reports composite index (status ASC, createdAt ASC) — oldest
    // open case first, a fair moderation FIFO.
    const snap = await getDocs(
      query(
        collection(firebaseFirestore(), "reports"),
        where("status", "==", status),
        orderBy("createdAt", "asc"),
      ),
    );
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        reporterUid: (data.reporterUid as string | undefined) ?? "",
        targetUid: (data.targetUid as string | undefined) ?? "",
        targetType: (data.targetType as ReportTargetType | undefined) ?? "profile",
        reason: (data.reason as ReportReason | undefined) ?? "other",
        details: (data.details as string | undefined) ?? "",
        status: (data.status as ReportStatus | undefined) ?? "open",
        handledBy: (data.handledBy as string | null | undefined) ?? null,
        resolutionNote: (data.resolutionNote as string | null | undefined) ?? null,
        createdAt: tsToIso(data.createdAt),
        resolvedAt:
          data.resolvedAt instanceof Timestamp ? data.resolvedAt.toDate().toISOString() : null,
      };
    });
  }

  async transitionReport(id: string, next: ReportStatus): Promise<void> {
    const callable = httpsCallable<{ id: string; next: ReportStatus }, void>(
      firebaseFunctions(),
      "transitionReport",
    );
    await callable({ id, next });
  }

  async applySanction(targetUid: string, sanction: Sanction, note?: string): Promise<void> {
    const callable = httpsCallable<{ targetUid: string; sanction: Sanction; note?: string }, void>(
      firebaseFunctions(),
      "applySanction",
    );
    await callable(note !== undefined ? { targetUid, sanction, note } : { targetUid, sanction });
  }

  async listUsers(filter: UserFilter = {}): Promise<AdminUser[]> {
    // Staff read of `users`, newest first; role/status/text filters are applied
    // in-memory so the console stays responsive without a per-combination index.
    const snap = await getDocs(
      query(collection(firebaseFirestore(), "users"), orderBy("createdAt", "desc")),
    );
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          email: (data.email as string | null | undefined) ?? null,
          displayName: (data.displayName as string | null | undefined) ?? null,
          role: (data.role as Role | undefined) ?? "user",
          status: (data.status as AccountStatus | undefined) ?? "active",
          createdAt: tsToIso(data.createdAt),
          lastActiveAt:
            data.lastActiveAt instanceof Timestamp
              ? data.lastActiveAt.toDate().toISOString()
              : null,
        } satisfies AdminUser;
      })
      .filter((u) => matchesUserFilter(u, filter));
  }

  async assignRole(uid: string, role: Role): Promise<void> {
    const callable = httpsCallable<{ uid: string; role: Role }, void>(
      firebaseFunctions(),
      "assignRole",
    );
    await callable({ uid, role });
  }

  async setAccountStatus(uid: string, status: AccountStatus, note?: string): Promise<void> {
    const callable = httpsCallable<{ uid: string; status: AccountStatus; note?: string }, void>(
      firebaseFunctions(),
      "setAccountStatus",
    );
    await callable(note !== undefined ? { uid, status, note } : { uid, status });
  }
}

export const adminRepository: AdminRepository = new FirestoreAdminRepository();
