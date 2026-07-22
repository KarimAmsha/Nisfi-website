import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Unit 6.5 — auditLogs + systemHealth rules. auditLogs: superAdmin-only read,
 * immutable (no client write). systemHealth: staff read, Functions-only write.
 * Sections 6.5, 10.11, 11.4. */
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
    await setDoc(doc(ctx.firestore(), "auditLogs/e1"), { action: "sanction", actorUid: "s1" });
    await setDoc(doc(ctx.firestore(), "systemHealth/current"), {
      environment: "production",
      status: "healthy",
    });
  });
});

describe("auditLogs rules — Unit 6.5", () => {
  it("lets a superAdmin read but denies admin/moderator (superAdmin-only)", async () => {
    const su = testEnv.authenticatedContext("boss", { role: "superAdmin" }).firestore();
    await assertSucceeds(getDoc(doc(su, "auditLogs/e1")));
    const admin = testEnv.authenticatedContext("a", { role: "admin" }).firestore();
    await assertFails(getDoc(doc(admin, "auditLogs/e1")));
  });

  it("denies any client write (immutable)", async () => {
    const su = testEnv.authenticatedContext("boss", { role: "superAdmin" }).firestore();
    await assertFails(setDoc(doc(su, "auditLogs/e2"), { action: "x", actorUid: "s1" }));
  });
});

describe("systemHealth rules — Unit 6.5", () => {
  it("lets staff read and denies a plain member", async () => {
    const mod = testEnv.authenticatedContext("m", { role: "moderator" }).firestore();
    await assertSucceeds(getDoc(doc(mod, "systemHealth/current")));
    const member = testEnv.authenticatedContext("omar").firestore();
    await assertFails(getDoc(doc(member, "systemHealth/current")));
  });

  it("denies a client write even from an admin (Functions-only)", async () => {
    const admin = testEnv.authenticatedContext("a", { role: "admin" }).firestore();
    await assertFails(
      setDoc(doc(admin, "systemHealth/current"), { status: "down" }, { merge: true }),
    );
  });
});
