import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { addDoc, collection, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";

/** Unit 4.2 — match message rules: active participants create the exact schema;
 * sender soft-deletes own within 15m; moderation/hard-delete denied. F6, 11.4. */
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

const PAIR = "aisha_omar";

async function seedActive(uid: string): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `users/${uid}`), { status: "active" });
  });
}

async function seedMatch(status = "active"): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), `matches/${PAIR}`), {
      uids: ["aisha", "omar"],
      status,
      createdAt: new Date(),
    });
  });
}

function validMessage(): Record<string, unknown> {
  return {
    senderUid: "omar",
    text: "Assalamu alaikum",
    deleted: false,
    moderation: { flagged: false },
    createdAt: serverTimestamp(),
  };
}

describe("message rules — Unit 4.2", () => {
  it("lets an active participant send a well-formed message", async () => {
    await seedActive("omar");
    await seedMatch();
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertSucceeds(addDoc(collection(db, `matches/${PAIR}/messages`), validMessage()));
  });

  it("lets a participant read the messages", async () => {
    await seedMatch();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await addDoc(collection(ctx.firestore(), `matches/${PAIR}/messages`), {
        ...validMessage(),
        createdAt: new Date(),
      });
    });
    const db = testEnv.authenticatedContext("aisha").firestore();
    await assertSucceeds(getDocs(collection(db, `matches/${PAIR}/messages`)));
  });

  it("denies a non-participant sending or reading", async () => {
    await seedActive("zaid");
    await seedMatch();
    const db = testEnv.authenticatedContext("zaid").firestore();
    await assertFails(addDoc(collection(db, `matches/${PAIR}/messages`), validMessage()));
    await assertFails(getDocs(collection(db, `matches/${PAIR}/messages`)));
  });

  it("denies spoofing another sender", async () => {
    await seedActive("omar");
    await seedMatch();
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      addDoc(collection(db, `matches/${PAIR}/messages`), { ...validMessage(), senderUid: "aisha" }),
    );
  });

  it("denies a client pre-flagging moderation", async () => {
    await seedActive("omar");
    await seedMatch();
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      addDoc(collection(db, `matches/${PAIR}/messages`), {
        ...validMessage(),
        moderation: { flagged: true },
      }),
    );
  });

  it("denies an empty or over-long message", async () => {
    await seedActive("omar");
    await seedMatch();
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(
      addDoc(collection(db, `matches/${PAIR}/messages`), { ...validMessage(), text: "" }),
    );
    await assertFails(
      addDoc(collection(db, `matches/${PAIR}/messages`), {
        ...validMessage(),
        text: "x".repeat(1001),
      }),
    );
  });

  it("denies sending to a closed match", async () => {
    await seedActive("omar");
    await seedMatch("closed");
    const db = testEnv.authenticatedContext("omar").firestore();
    await assertFails(addDoc(collection(db, `matches/${PAIR}/messages`), validMessage()));
  });
});
