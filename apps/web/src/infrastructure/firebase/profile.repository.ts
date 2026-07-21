import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import type {
  EditableProfile,
  PrivateProfile,
  PublicProfile,
  VerificationStatus,
} from "@nisfi/shared";
import type { ProfileRepository } from "@/core/ports/profile";
import { firebaseFirestore } from "./client";

function tsToIso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : "";
}

function toPublicProfile(uid: string, data: DocumentData): PublicProfile {
  return {
    ...(data as unknown as EditableProfile),
    uid,
    verificationStatus: (data.verificationStatus as VerificationStatus | undefined) ?? "unverified",
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  };
}

class FirestoreProfileRepository implements ProfileRepository {
  private profileRef(uid: string) {
    return doc(firebaseFirestore(), "profiles", uid);
  }

  private privateRef(uid: string) {
    return doc(firebaseFirestore(), "profiles", uid, "private", "main");
  }

  async getOwn(uid: string): Promise<PublicProfile | null> {
    return this.getPublic(uid);
  }

  async getPublic(uid: string): Promise<PublicProfile | null> {
    const snap = await getDoc(this.profileRef(uid));
    return snap.exists() ? toPublicProfile(uid, snap.data()) : null;
  }

  async saveOwn(uid: string, data: Partial<EditableProfile>): Promise<void> {
    const ref = this.profileRef(uid);
    const exists = (await getDoc(ref)).exists();
    await setDoc(
      ref,
      {
        ...data,
        updatedAt: serverTimestamp(),
        ...(exists ? {} : { createdAt: serverTimestamp() }),
      },
      { merge: true },
    );
  }

  async getPrivate(uid: string): Promise<PrivateProfile | null> {
    const snap = await getDoc(this.privateRef(uid));
    return snap.exists() ? snap.data() : null;
  }

  async savePrivate(uid: string, data: PrivateProfile): Promise<void> {
    await setDoc(this.privateRef(uid), { ...data, updatedAt: serverTimestamp() }, { merge: true });
  }
}

export const profileRepository: ProfileRepository = new FirestoreProfileRepository();
