import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { addDoc, collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";

/** Unit 5.4 — reports rules: active member creates an exact `open` report about
 * someone else; staff read; transitions/sanctions server-only. F8, 11.4. */
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

function validReport(reporter: string, target: string): Record<string, unknown> {
  return {
    reporterUid: reporter,
    targetUid: target,
    targetType: "profile",
    reason: "harassment",
    details: "inappropriate messages",
    status: "open",
    handledBy: null,
    resolutionNote: null,
    createdAt: serverTimestamp(),
    resolvedAt: null,
  };
}

describe("reports rules — Unit 5.4", () => {
  it("lets an active member file a well-formed report", async () => {
    await seedActive("omar");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(addDoc(collection(db, "reports"), validReport("omar", "aisha")));
  });

  it("denies reporting yourself", async () => {
    await seedActive("omar");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(addDoc(collection(db, "reports"), validReport("omar", "omar")));
  });

  it("denies spoofing the reporter or an invalid reason", async () => {
    await seedActive("omar");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(addDoc(collection(db, "reports"), validReport("aisha", "zaid")));
    await assertFails(
      addDoc(collection(db, "reports"), { ...validReport("omar", "aisha"), reason: "bogus" }),
    );
  });

  it("denies creating a non-open report", async () => {
    await seedActive("omar");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      addDoc(collection(db, "reports"), { ...validReport("omar", "aisha"), status: "resolved" }),
    );
  });

  it("lets staff read reports but denies members", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "reports/r1"), validReport("omar", "aisha"));
    });
    const staff = testEnv.authenticatedContext("mod", { role: "moderator" }).firestore();
    await assertSucceeds(getDocs(collection(staff, "reports")));
    await seedActive("bob");
    const member = testEnv.authenticatedContext("bob").firestore();
    await assertFails(getDocs(collection(member, "reports")));
  });

  it("denies a client transitioning a report", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "reports/r2"), validReport("omar", "aisha"));
    });
    const staff = testEnv.authenticatedContext("mod", { role: "moderator" }).firestore();
    await assertFails(setDoc(doc(staff, "reports/r2"), { status: "resolved" }, { merge: true }));
  });
});
