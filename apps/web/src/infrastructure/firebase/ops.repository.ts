import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  Timestamp,
  where,
  type DocumentData,
  type QueryConstraint,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import {
  matchesAuditFilter,
  type AuditFilter,
  type AuditLogEntry,
  type ExportTable,
  type HealthCheck,
  type HealthStatus,
  type Role,
  type SystemHealth,
} from "@nisfi/shared";
import type { ExportOutput, OpsRepository } from "@/core/ports/ops";
import { firebaseFirestore, firebaseFunctions } from "./client";

function toEntry(id: string, data: DocumentData): AuditLogEntry {
  return {
    id,
    actorUid: (data.actorUid as string | undefined) ?? "",
    actorRole: (data.actorRole as Role | undefined) ?? "user",
    action: (data.action as string | undefined) ?? "",
    targetType: (data.targetType as string | undefined) ?? "",
    targetId: (data.targetId as string | undefined) ?? "",
    metadata: (data.metadata as Record<string, unknown> | undefined) ?? {},
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : new Date(0).toISOString(),
  };
}

class FirestoreOpsRepository implements OpsRepository {
  async listAudit(filter: AuditFilter = {}): Promise<AuditLogEntry[]> {
    // Server-side narrow by action when given (an indexed field); the rest of
    // the filter is applied in-memory over the bounded page.
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), fbLimit(50)];
    if (filter.action) constraints.unshift(where("action", "==", filter.action));
    const snap = await getDocs(query(collection(firebaseFirestore(), "auditLogs"), ...constraints));
    return snap.docs
      .map((d) => toEntry(d.id, d.data()))
      .filter((e) => matchesAuditFilter(e, filter));
  }

  async exportTable(table: ExportTable): Promise<ExportOutput> {
    const callable = httpsCallable<{ table: ExportTable }, ExportOutput>(
      firebaseFunctions(),
      "exportAdminTable",
    );
    const res = await callable({ table });
    return res.data;
  }

  async getHealth(): Promise<SystemHealth | null> {
    const snap = await getDoc(doc(firebaseFirestore(), "systemHealth", "current"));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      environment: (data.environment as string | undefined) ?? "unknown",
      release: (data.release as string | undefined) ?? "unknown",
      status: (data.status as HealthStatus | undefined) ?? "healthy",
      checks: (data.checks as Record<string, HealthCheck> | undefined) ?? {},
      updatedAt:
        data.updatedAt instanceof Timestamp
          ? data.updatedAt.toDate().toISOString()
          : new Date(0).toISOString(),
    };
  }
}

export const opsRepository: OpsRepository = new FirestoreOpsRepository();
