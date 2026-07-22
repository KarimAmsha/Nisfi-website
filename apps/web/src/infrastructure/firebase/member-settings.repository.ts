import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { mergeMemberPreferences, type Locale, type MemberPreferences } from "@nisfi/shared";
import type { MemberSettings, MemberSettingsRepository } from "@/core/ports/member-settings";
import { firebaseFirestore, firebaseFunctions } from "./client";

const LOCALES: readonly Locale[] = ["ar", "en", "tr"];

class FirestoreMemberSettingsRepository implements MemberSettingsRepository {
  async getSettings(uid: string): Promise<MemberSettings> {
    const snap = await getDoc(doc(firebaseFirestore(), "users", uid));
    const data = snap.exists() ? snap.data() : {};
    const rawLocale = data.locale as string | undefined;
    return {
      locale:
        rawLocale !== undefined && LOCALES.includes(rawLocale as Locale)
          ? (rawLocale as Locale)
          : null,
      preferences: mergeMemberPreferences(data.preferences),
    };
  }

  async savePreferences(uid: string, preferences: MemberPreferences): Promise<void> {
    // Owner-allowed keys only (rules: locale / preferences / updatedAt).
    await updateDoc(doc(firebaseFirestore(), "users", uid), {
      preferences,
      updatedAt: serverTimestamp(),
    });
  }

  async saveLocale(uid: string, locale: Locale): Promise<void> {
    await updateDoc(doc(firebaseFirestore(), "users", uid), {
      locale,
      updatedAt: serverTimestamp(),
    });
  }

  async requestDataExport(uid: string): Promise<void> {
    const callable = httpsCallable<{ uid: string }, void>(firebaseFunctions(), "requestDataExport");
    await callable({ uid });
  }

  async requestAccountDeletion(uid: string): Promise<void> {
    const callable = httpsCallable<{ uid: string }, void>(
      firebaseFunctions(),
      "requestAccountDeletion",
    );
    await callable({ uid });
  }
}

export const memberSettingsRepository: MemberSettingsRepository =
  new FirestoreMemberSettingsRepository();
