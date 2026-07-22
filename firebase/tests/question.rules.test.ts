import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Unit 6.1 — questionBank rules: any signed-in member reads the compatibility
 * questions (onboarding needs them); all writes are server-only. Sections 6.1,
 * 10.9, 11.4. */
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
    await setDoc(doc(ctx.firestore(), "questionBank/prayer"), {
      order: 1,
      active: true,
      text: { ar: "س", en: "q", tr: "s" },
      options: [{ id: "a", label: { ar: "أ", en: "a", tr: "a" } }],
    });
  });
});

describe("questionBank rules — Unit 6.1", () => {
  it("lets any signed-in member read a question", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(getDoc(doc(db, "questionBank/prayer")));
  });

  it("denies an unauthenticated read", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "questionBank/prayer")));
  });

  it("denies a client write even from an admin (server-only)", async () => {
    const admin = testEnv.authenticatedContext("boss", { role: "admin" }).firestore();
    await assertFails(
      setDoc(doc(admin, "questionBank/prayer"), { active: false }, { merge: true }),
    );
    await assertFails(
      setDoc(doc(admin, "questionBank/new"), {
        order: 2,
        active: true,
        text: { ar: "س", en: "q", tr: "s" },
        options: [],
      }),
    );
  });
});
