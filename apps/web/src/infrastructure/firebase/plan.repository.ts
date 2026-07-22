import { collection, doc, getDoc, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type { Entitlement, LocalizedText, Plan } from "@nisfi/shared";
import type { PlanRepository } from "@/core/ports/plan";
import { firebaseFirestore, firebaseFunctions } from "./client";

const emptyText: LocalizedText = { ar: "", en: "", tr: "" };

class FirestorePlanRepository implements PlanRepository {
  async listPlans(): Promise<Plan[]> {
    const snap = await getDocs(query(collection(firebaseFirestore(), "plans"), orderBy("id")));
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: (data.name as LocalizedText | undefined) ?? emptyText,
        priceMonthly: (data.priceMonthly as number | null | undefined) ?? null,
        limits: (data.limits as Record<string, number> | undefined) ?? {},
        active: (data.active as boolean | undefined) ?? true,
      };
    });
  }

  async getEntitlement(uid: string): Promise<Entitlement | null> {
    const snap = await getDoc(doc(firebaseFirestore(), "users", uid));
    if (!snap.exists()) return null;
    const ent = snap.data().entitlements as
      { plan?: string; grantedAt?: unknown; grantedBy?: string | null } | undefined;
    if (ent === undefined) return null;
    return {
      plan: ent.plan ?? "free",
      grantedAt:
        ent.grantedAt instanceof Timestamp
          ? ent.grantedAt.toDate().toISOString()
          : new Date(0).toISOString(),
      grantedBy: ent.grantedBy ?? null,
    };
  }

  async grantEntitlement(uid: string, planId: string): Promise<void> {
    const callable = httpsCallable<{ uid: string; planId: string }, void>(
      firebaseFunctions(),
      "grantEntitlement",
    );
    await callable({ uid, planId });
  }
}

export const planRepository: PlanRepository = new FirestorePlanRepository();
