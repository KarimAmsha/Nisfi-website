import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

/** Unit 2.5 — verificationRequests rules (master spec Sections F3, 11.2). */
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

async function seedRequest(id: string, uid: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `verificationRequests/${id}`), {
      uid,
      type: "selfieId",
      status: "pending",
    });
  });
}

describe("verificationRequests rules — Unit 2.5", () => {
  it("lets an active owner create a pending request for themselves", async () => {
    await seedActive("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(
      setDoc(doc(db, "verificationRequests/r1"), {
        uid: "alice",
        type: "selfieId",
        status: "pending",
        reason: null,
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("rejects creating a request that is not pending", async () => {
    await seedActive("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(db, "verificationRequests/r2"), {
        uid: "alice",
        type: "selfieId",
        status: "approved",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("rejects creating a request for another user", async () => {
    await seedActive("alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(db, "verificationRequests/r3"), {
        uid: "bob",
        type: "selfieId",
        status: "pending",
        createdAt: serverTimestamp(),
      }),
    );
  });

  it("lets the owner read their own request", async () => {
    await seedRequest("r4", "alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(getDoc(doc(db, "verificationRequests/r4")));
  });

  it("denies another member reading someone's request", async () => {
    await seedRequest("r5", "alice");
    const db = testEnv.authenticatedContext("bob").firestore();
    await assertFails(getDoc(doc(db, "verificationRequests/r5")));
  });

  it("lets staff read a request", async () => {
    await seedRequest("r6", "alice");
    const db = testEnv.authenticatedContext("mod", { role: "moderator" }).firestore();
    await assertSucceeds(getDoc(doc(db, "verificationRequests/r6")));
  });

  it("denies the owner updating (the decision is server-only)", async () => {
    await seedRequest("r7", "alice");
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(
      setDoc(doc(db, "verificationRequests/r7"), { status: "approved" }, { merge: true }),
    );
  });
});
