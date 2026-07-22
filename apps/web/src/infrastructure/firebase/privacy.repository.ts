import { httpsCallable } from "firebase/functions";
import type { MemberExport } from "@nisfi/shared";
import type { PrivacyRepository } from "@/core/ports/privacy";
import { firebaseFunctions } from "./client";

class FirebasePrivacyRepository implements PrivacyRepository {
  async exportMyData(uid: string): Promise<MemberExport> {
    const callable = httpsCallable<{ uid: string }, MemberExport>(
      firebaseFunctions(),
      "exportMyData",
    );
    const res = await callable({ uid });
    return res.data;
  }

  async deleteMyAccount(uid: string): Promise<void> {
    const callable = httpsCallable<{ uid: string }, void>(firebaseFunctions(), "deleteMyAccount");
    await callable({ uid });
  }
}

export const privacyRepository: PrivacyRepository = new FirebasePrivacyRepository();
