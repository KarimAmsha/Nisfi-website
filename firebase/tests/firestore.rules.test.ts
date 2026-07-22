import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * Unit 0.5 baseline rules tests. Runs against the Firestore emulator started by
 * `firebase emulators:exec` (see the root `test:rules` script). Per-collection
 * matrices (master spec Section 11.4) are expanded in each feature unit.
 */
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

async function seedActiveUser(uid: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `users/${uid}`), { status: "active" });
  });
}

describe("firestore rules — Unit 0.5 baseline", () => {
  it("denies an unauthenticated read of a user document", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "users/alice")));
  });

  it("allows an owner to read their own user document", async () => {
    await seedActiveUser("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(getDoc(doc(db, "users/alice")));
  });

  it("denies reading another member's user document", async () => {
    await seedActiveUser("alice");
    const db = testEnv.authenticatedContext("bob").firestore();
    await assertFails(getDoc(doc(db, "users/alice")));
  });

  it("allows a moderator (custom claim) to read any user document", async () => {
    await seedActiveUser("alice");
    const db = testEnv.authenticatedContext("mod", { role: "moderator" }).firestore();
    await assertSucceeds(getDoc(doc(db, "users/alice")));
  });

  it("denies an owner writing a non-allow-listed field on their user document", async () => {
    await seedActiveUser("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "users/alice"), { role: "admin" }, { merge: true }));
  });

  it("denies an owner writing their own account status (no self-reinstate, Unit 5.5)", async () => {
    // Seed suspended so writing `active` is a real change, not a no-op diff.
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "users/alice"), { status: "suspended" });
    });
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "users/alice"), { status: "active" }, { merge: true }));
  });

  it("denies a staff client writing another member's role or status (server-only, Unit 5.5)", async () => {
    await seedActiveUser("alice");
    const admin = testEnv.authenticatedContext("boss", { role: "admin" }).firestore();
    await assertFails(setDoc(doc(admin, "users/alice"), { role: "moderator" }, { merge: true }));
    await assertFails(setDoc(doc(admin, "users/alice"), { status: "banned" }, { merge: true }));
  });

  it("denies client writes to an undesigned collection (default deny)", async () => {
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "matches/xyz"), { foo: 1 }));
  });

  it("denies client reads of audit logs", async () => {
    const db = testEnv.authenticatedContext("alice", { role: "admin" }).firestore();
    await assertFails(getDoc(doc(db, "auditLogs/entry1")));
  });
});
