import { applicationDefault, cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

/**
 * Firebase Admin initialization for Cloud Functions (master spec Section 12).
 * Credentials are read from the environment — an explicit service account when
 * `FIREBASE_*` variables are set, otherwise Application Default Credentials (the
 * managed identity in deployed Functions and the emulator locally). Secrets are
 * never hardcoded or committed.
 */
let app: App | undefined;

export function adminApp(): App {
  if (app) {
    return app;
  }
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  app =
    projectId && clientEmail && privateKey
      ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
      : initializeApp({ credential: applicationDefault() });

  return app;
}

export function adminFirestore(): Firestore {
  return getFirestore(adminApp());
}

export function adminAuth(): Auth {
  return getAuth(adminApp());
}

export function adminStorage(): Storage {
  return getStorage(adminApp());
}
