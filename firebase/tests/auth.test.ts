import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from "firebase/auth";

/**
 * Unit 1.4 auth path, exercised against the Firebase Auth emulator started by
 * `firebase emulators:exec` (root `test:rules` script includes `auth`). No real
 * project keys are used (directive O-001).
 */
let app: FirebaseApp;
let auth: Auth;

beforeAll(() => {
  app = initializeApp({ apiKey: "demo-api-key", projectId: "demo-nisfi" }, "auth-test");
  auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
});

afterAll(async () => {
  await deleteApp(app);
});

describe("firebase auth emulator", () => {
  it("creates a user (unverified), signs out, and signs back in", async () => {
    const email = `u${Date.now()}@example.com`;
    const created = await createUserWithEmailAndPassword(auth, email, "password123");
    expect(created.user.email).toBe(email);
    expect(created.user.emailVerified).toBe(false);

    await signOut(auth);

    const back = await signInWithEmailAndPassword(auth, email, "password123");
    expect(back.user.uid).toBe(created.user.uid);
  });

  it("rejects a wrong password", async () => {
    const email = `w${Date.now()}@example.com`;
    await createUserWithEmailAndPassword(auth, email, "password123");
    await signOut(auth);
    await expect(signInWithEmailAndPassword(auth, email, "wrongpass")).rejects.toBeDefined();
  });
});
