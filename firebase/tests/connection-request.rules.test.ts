import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";

/** Unit 3.4 — connectionRequests rules: participant/staff read; all writes are
 * server-only (CF6/CF7). Master spec Sections F5, 11.4. */
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

async function seedRequest(id: string, fromUid: string, toUid: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `connectionRequests/${id}`), {
      pairKey: [fromUid, toUid].sort().join("_"),
      fromUid,
      toUid,
      message: "Assalamu alaikum",
      status: "pending",
      createdAt: new Date(),
      respondedAt: null,
    });
  });
}

describe("connectionRequests rules — Unit 3.4", () => {
  it("lets the sender read their own request", async () => {
    await seedRequest("r1", "omar", "aisha");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(getDoc(doc(db, "connectionRequests/r1")));
  });

  it("lets the recipient read the request", async () => {
    await seedRequest("r2", "omar", "aisha");
    const db = testEnv.authenticatedContext("aisha").firestore();
    await assertSucceeds(getDoc(doc(db, "connectionRequests/r2")));
  });

  it("denies a non-participant reading the request", async () => {
    await seedRequest("r3", "omar", "aisha");
    const db = testEnv.authenticatedContext("zaid").firestore();
    await assertFails(getDoc(doc(db, "connectionRequests/r3")));
  });

  it("denies an unauthenticated read", async () => {
    await seedRequest("r4", "omar", "aisha");
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "connectionRequests/r4")));
  });

  it("lets staff read any request", async () => {
    await seedRequest("r5", "omar", "aisha");
    const db = testEnv.authenticatedContext("mod", { role: "moderator" }).firestore();
    await assertSucceeds(getDoc(doc(db, "connectionRequests/r5")));
  });

  it("denies a client creating a request directly (server-only)", async () => {
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      setDoc(doc(db, "connectionRequests/new1"), {
        pairKey: "aisha_omar",
        fromUid: "omar",
        toUid: "aisha",
        message: "hi",
        status: "pending",
        createdAt: new Date(),
        respondedAt: null,
      }),
    );
  });

  it("denies a client transitioning a request (e.g. accept)", async () => {
    await seedRequest("r6", "omar", "aisha");
    const db = testEnv.authenticatedContext("aisha").firestore();
    await assertFails(
      setDoc(doc(db, "connectionRequests/r6"), { status: "accepted" }, { merge: true }),
    );
  });
});
