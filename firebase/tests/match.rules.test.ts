import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Unit 4.1 — matches rules: the two participants may read; all writes are
 * server-only (clients can never create matches). Master spec Sections F6, 11.4. */
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

async function seedMatch(pairKey: string, uids: string[]): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `matches/${pairKey}`), {
      uids,
      participants: {},
      status: "active",
      photoReveal: {},
      unread: {},
      requestId: "req1",
      createdAt: new Date(),
      lastMessageAt: null,
    });
  });
}

describe("matches rules — Unit 4.1", () => {
  it("lets a participant read their match", async () => {
    await seedMatch("aisha_omar", ["aisha", "omar"]);
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(getDoc(doc(db, "matches/aisha_omar")));
  });

  it("denies a non-participant reading the match", async () => {
    await seedMatch("aisha_omar", ["aisha", "omar"]);
    const db = testEnv.authenticatedContext("zaid").firestore();
    await assertFails(getDoc(doc(db, "matches/aisha_omar")));
  });

  it("denies an unauthenticated read", async () => {
    await seedMatch("aisha_omar", ["aisha", "omar"]);
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "matches/aisha_omar")));
  });

  it("denies a client creating a match (server-only)", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      setDoc(doc(db, "matches/aisha_omar"), {
        uids: ["aisha", "omar"],
        status: "active",
        createdAt: new Date(),
      }),
    );
  });

  it("denies a participant updating the match (e.g. closing it)", async () => {
    await seedMatch("aisha_omar", ["aisha", "omar"]);
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(setDoc(doc(db, "matches/aisha_omar"), { status: "closed" }, { merge: true }));
  });
});
