import { doc, getDoc } from "firebase/firestore";
import { ACCOUNT_STATUSES, type AccountStatus } from "@nisfi/shared";
import type { AccountRepository } from "@/core/ports/account";
import { firebaseFirestore } from "./client";

class FirestoreAccountRepository implements AccountRepository {
  async getStatus(uid: string): Promise<AccountStatus> {
    const snap = await getDoc(doc(firebaseFirestore(), "users", uid));
    const raw = snap.exists() ? (snap.data().status as string | undefined) : undefined;
    // A missing/unknown status is treated as active (fail-open for UX only; the
    // rules are the real gate and deny non-active writes regardless).
    return raw !== undefined && ACCOUNT_STATUSES.includes(raw as AccountStatus)
      ? (raw as AccountStatus)
      : "active";
  }
}

export const accountRepository: AccountRepository = new FirestoreAccountRepository();
