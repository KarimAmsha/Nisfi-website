import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

/** Unit 7.2 — a deleted (anonymized) account is locked out: `isActive()` is
 * false, so all product writes are denied, same as suspended/banned. F11, 11.4. */
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
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), "users/omar"), { status: "deleted" });
    await setDoc(doc(ctx.firestore(), "profiles/aisha"), {
      visibility: "visible",
      verificationStatus: "verified",
    });
  });
});

describe("deleted-account lockout — Unit 7.2", () => {
  it("denies a deleted member creating a report (isActive false)", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      addDoc(collection(db, "reports"), {
        reporterUid: "omar",
        targetUid: "aisha",
        targetType: "profile",
        reason: "harassment",
        details: "x",
        status: "open",
        handledBy: null,
        resolutionNote: null,
        createdAt: serverTimestamp(),
        resolvedAt: null,
      }),
    );
  });

  it("denies a deleted member submitting a verification request", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      addDoc(collection(db, "verificationRequests"), { uid: "omar", status: "pending" }),
    );
  });
});
