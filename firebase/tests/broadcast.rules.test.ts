import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Unit 6.3 — broadcasts rules: admin-only read; all writes server-only (the
 * broadcast CF composes/dispatches with audit). Section 6.3. */
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
    await setDoc(doc(ctx.firestore(), "broadcasts/b1"), { audience: "all", status: "sent" });
  });
});

describe("broadcasts rules — Unit 6.3", () => {
  it("lets an admin read a broadcast", async () => {
    const db = testEnv.authenticatedContext("boss", { role: "admin" }).firestore();
    await assertSucceeds(getDoc(doc(db, "broadcasts/b1")));
  });

  it("denies a moderator and a plain member (admin-only)", async () => {
    const mod = testEnv.authenticatedContext("mod", { role: "moderator" }).firestore();
    await assertFails(getDoc(doc(mod, "broadcasts/b1")));
    const member = testEnv.authenticatedContext("omar").firestore();
    await assertFails(getDoc(doc(member, "broadcasts/b1")));
  });

  it("denies a client write even from an admin (server-only)", async () => {
    const admin = testEnv.authenticatedContext("boss", { role: "admin" }).firestore();
    await assertFails(setDoc(doc(admin, "broadcasts/b2"), { audience: "all", status: "draft" }));
  });
});
