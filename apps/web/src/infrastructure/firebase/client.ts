import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { appCheckSiteKey, firebaseConfig } from "./env";

/**
 * The web app's Firebase client. This module (under
 * `infrastructure/firebase/**`) is the ONLY place the web app may import
 * `firebase/*` (master spec Section 5.1, enforced by the ESLint boundary rule).
 * Product code consumes domain ports, not these SDK handles directly.
 */
let app: FirebaseApp | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig());
  }
  return app;
}

let appCheckStarted = false;

/** Initialise Firebase App Check (browser only, when a site key is configured). */
export function ensureAppCheck(): void {
  if (typeof window === "undefined" || appCheckStarted) {
    return;
  }
  const siteKey = appCheckSiteKey();
  if (!siteKey) {
    return;
  }
  initializeAppCheck(getFirebaseApp(), {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: true,
  });
  appCheckStarted = true;
}

export function firebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function firebaseFirestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function firebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}
