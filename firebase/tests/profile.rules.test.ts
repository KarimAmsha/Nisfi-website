import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

/** Unit 2.1 — private/public profile split rules (master spec Sections 10.2, 11.2). */
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-nisfi",
    firestore: { rules: readFileSync("firestore.rules", "utf8") },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

async function seedActive(uid: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `users/${uid}`), { status: "active" });
  });
}

async function seedProfile(uid: string, over: Record<string, unknown> = {}): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `profiles/${uid}`), {
      displayName: "Seed",
      gender: "female",
      visibility: "visible",
      verificationStatus: "verified",
      ...over,
    });
  });
}

function validProfile(): Record<string, unknown> {
  return {
    displayName: "Aisha",
    gender: "female",
    birthDate: "1996-05-01",
    country: "TR",
    city: "Istanbul",
    maritalStatus: "single",
    children: "none",
    religiousness: "practicing",
    marriageTimeline: "withinYear",
    languages: ["ar", "en"],
    visibility: "visible",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

describe("profile rules — Unit 2.1", () => {
  it("lets an owner create their profile with only editable fields", async () => {
    await seedActive("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(db, "profiles/alice"), validProfile()));
  });

  it("rejects a client-set system field (verificationStatus) on the profile", async () => {
    await seedActive("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(db, "profiles/alice"), { ...validProfile(), verificationStatus: "verified" }),
    );
  });

  it("lets another active member read an eligible (visible + verified) profile", async () => {
    await seedActive("bob");
    await seedProfile("alice");
    const db = testEnv.authenticatedContext("bob").firestore();
    await assertSucceeds(getDoc(doc(db, "profiles/alice")));
  });

  it("denies another member reading a hidden profile", async () => {
    await seedActive("bob");
    await seedProfile("alice", { visibility: "hidden" });
    const db = testEnv.authenticatedContext("bob").firestore();
    await assertFails(getDoc(doc(db, "profiles/alice")));
  });

  it("denies another member reading an unverified profile", async () => {
    await seedActive("bob");
    await seedProfile("alice", { verificationStatus: "unverified" });
    const db = testEnv.authenticatedContext("bob").firestore();
    await assertFails(getDoc(doc(db, "profiles/alice")));
  });

  it("still lets the owner read their own not-yet-eligible profile", async () => {
    await seedProfile("alice", { visibility: "hidden", verificationStatus: "unverified" });
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(getDoc(doc(db, "profiles/alice")));
  });

  it("denies an unauthenticated read of a profile", async () => {
    await seedProfile("alice");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "profiles/alice")));
  });

  it("lets a moderator read any profile, even hidden/unverified", async () => {
    await seedProfile("alice", { visibility: "hidden", verificationStatus: "unverified" });
    const db = testEnv.authenticatedContext("mod", { role: "moderator" }).firestore();
    await assertSucceeds(getDoc(doc(db, "profiles/alice")));
  });

  it("keeps a member's private sub-document private from other members", async () => {
    await seedActive("bob");
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "profiles/alice/private/main"), { phoneNumber: "x" });
    });
    const db = testEnv.authenticatedContext("bob").firestore();
    await assertFails(getDoc(doc(db, "profiles/alice/private/main")));
  });

  it("lets the owner write and read their private sub-document", async () => {
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(db, "profiles/alice/private/main"), { phoneNumber: "123" }));
    await assertSucceeds(getDoc(doc(db, "profiles/alice/private/main")));
  });

  it("lets staff read a member's private sub-document", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "profiles/alice/private/main"), { phoneNumber: "x" });
    });
    const db = testEnv.authenticatedContext("admin", { role: "admin" }).firestore();
    await assertSucceeds(getDoc(doc(db, "profiles/alice/private/main")));
  });
});
