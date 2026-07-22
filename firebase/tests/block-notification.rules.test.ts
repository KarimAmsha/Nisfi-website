import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Unit 3.6 — blocks (owner read, server-only writes) and notifications (owner
 * read, owner may flip `read` only). Master spec Sections F6, 10.6, 10.8, 11.4. */
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

describe("blocks rules — Unit 3.6", () => {
  it("lets the owner read their own block list", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "blocks/omar/blocked/aisha"), { createdAt: new Date() });
    });
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(getDoc(doc(db, "blocks/omar/blocked/aisha")));
  });

  it("denies reading someone else's block list", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "blocks/omar/blocked/aisha"), { createdAt: new Date() });
    });
    const db = testEnv.authenticatedContext("zaid").firestore();
    await assertFails(getDoc(doc(db, "blocks/omar/blocked/aisha")));
  });

  it("denies a client creating a block directly (server-only)", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(setDoc(doc(db, "blocks/omar/blocked/aisha"), { createdAt: new Date() }));
  });
});

describe("notifications rules — Unit 3.6", () => {
  async function seedNotification(uid: string, id: string): Promise<void> {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), `notifications/${uid}/items/${id}`), {
        type: "requestReceived",
        titleKey: "t",
        bodyKey: "b",
        params: {},
        link: null,
        read: false,
        createdAt: new Date(),
      });
    });
  }

  it("lets the owner read their notifications", async () => {
    await seedNotification("omar", "n1");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(getDoc(doc(db, "notifications/omar/items/n1")));
  });

  it("denies another member reading them", async () => {
    await seedNotification("omar", "n2");
    const db = testEnv.authenticatedContext("zaid").firestore();
    await assertFails(getDoc(doc(db, "notifications/omar/items/n2")));
  });

  it("lets the owner flip only `read`", async () => {
    await seedNotification("omar", "n3");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(
      setDoc(doc(db, "notifications/omar/items/n3"), { read: true }, { merge: true }),
    );
  });

  it("denies the owner editing other notification fields", async () => {
    await seedNotification("omar", "n4");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      setDoc(doc(db, "notifications/omar/items/n4"), { titleKey: "x" }, { merge: true }),
    );
  });

  it("denies a client creating a notification", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      setDoc(doc(db, "notifications/omar/items/new"), {
        type: "requestReceived",
        read: false,
        createdAt: new Date(),
      }),
    );
  });
});
