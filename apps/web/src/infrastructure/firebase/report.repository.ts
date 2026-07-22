import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import type { ReportInput } from "@nisfi/shared";
import type { ReportRepository } from "@/core/ports/report";
import { firebaseFirestore } from "./client";

class FirestoreReportRepository implements ReportRepository {
  async createReport(reporterUid: string, input: ReportInput): Promise<void> {
    // The exact `open` shape the rules allow; triage fields are server-set.
    await addDoc(collection(firebaseFirestore(), "reports"), {
      reporterUid,
      targetUid: input.targetUid,
      targetType: input.targetType,
      reason: input.reason,
      details: input.details,
      status: "open",
      handledBy: null,
      resolutionNote: null,
      createdAt: serverTimestamp(),
      resolvedAt: null,
    });
  }
}

export const reportRepository: ReportRepository = new FirestoreReportRepository();
