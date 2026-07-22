import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Unit 6.4 — plans rules: any signed-in member reads the plan catalog; all
 * writes are server-only (superAdmin via CF + audit). Sections 6.4, 10.12. */
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
    await setDoc(doc(ctx.firestore(), "plans/free"), {
      name: { ar: "المجاني", en: "Free", tr: "Ücretsiz" },
      priceMonthly: null,
      active: true,
    });
  });
});

describe("plans rules — Unit 6.4", () => {
  it("lets any signed-in member read a plan", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(getDoc(doc(db, "plans/free")));
  });

  it("denies an unauthenticated read", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "plans/free")));
  });

  it("denies a client write even from a superAdmin (server-only)", async () => {
    const su = testEnv.authenticatedContext("boss", { role: "superAdmin" }).firestore();
    await assertFails(setDoc(doc(su, "plans/free"), { active: false }, { merge: true }));
    await assertFails(setDoc(doc(su, "plans/gold"), { priceMonthly: 9, active: true }));
  });
});
