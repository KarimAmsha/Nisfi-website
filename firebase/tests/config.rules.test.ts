import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Unit 6.2 — appConfig rules: any signed-in member reads runtime config; all
 * writes are server-only (admin via the content CF + audit). Section 6.2. */
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
    await setDoc(doc(ctx.firestore(), "appConfig/platform"), {
      flags: { signupsEnabled: true },
      limits: { dailySends: 5 },
    });
  });
});

describe("appConfig rules — Unit 6.2", () => {
  it("lets any signed-in member read config", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(getDoc(doc(db, "appConfig/platform")));
  });

  it("denies an unauthenticated read", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "appConfig/platform")));
  });

  it("denies a client write even from an admin (server-only)", async () => {
    const admin = testEnv.authenticatedContext("boss", { role: "admin" }).firestore();
    await assertFails(
      setDoc(
        doc(admin, "appConfig/platform"),
        { flags: { signupsEnabled: false } },
        { merge: true },
      ),
    );
  });
});
