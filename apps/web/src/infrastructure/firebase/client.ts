import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { connectFunctionsEmulator, getFunctions, type Functions } from "firebase/functions";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { appCheckSiteKey, AUTH_EMULATOR_URL, firebaseConfig, useEmulator } from "./env";

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

let authEmulatorConnected = false;

export function firebaseAuth(): Auth {
  const auth = getAuth(getFirebaseApp());
  if (useEmulator() && !authEmulatorConnected) {
    connectAuthEmulator(auth, AUTH_EMULATOR_URL, { disableWarnings: true });
    authEmulatorConnected = true;
  }
  return auth;
}

export function firebaseFirestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function firebaseStorage(): FirebaseStorage {
  return getStorage(getFirebaseApp());
}

let functionsEmulatorConnected = false;

export function firebaseFunctions(): Functions {
  const functions = getFunctions(getFirebaseApp());
  if (useEmulator() && !functionsEmulatorConnected) {
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
    functionsEmulatorConnected = true;
  }
  return functions;
}
