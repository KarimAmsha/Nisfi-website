import type { FirebaseOptions } from "firebase/app";

/**
 * Firebase web configuration, read from `NEXT_PUBLIC_*` environment variables.
 * Values are owner-provided at setup time (never hardcoded — master spec
 * Section 4). Accessors validate lazily so a missing value fails loudly at the
 * point of use rather than silently shipping a misconfigured client.
 */
function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env.local and provide the Firebase web config, or set it in the deployment environment.`,
    );
  }
  return value;
}

/** True when the app should talk to the local Firebase emulators (no real
 * project keys — master spec directive O-001). */
export function useEmulator(): boolean {
  return process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true";
}

/** Auth emulator host, used by the client when {@link useEmulator} is on. */
export const AUTH_EMULATOR_URL = "http://127.0.0.1:9099";

export function firebaseConfig(): FirebaseOptions {
  // Emulator mode uses a demo project with placeholder values; the emulators
  // accept any non-empty config and never reach Google servers.
  if (useEmulator()) {
    return {
      apiKey: "demo-api-key",
      authDomain: "demo-nisfi.firebaseapp.com",
      projectId: "demo-nisfi",
      storageBucket: "demo-nisfi.appspot.com",
      messagingSenderId: "000000000000",
      appId: "1:000000000000:web:demo",
    };
  }
  return {
    apiKey: required("NEXT_PUBLIC_FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: required(
      "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    ),
    projectId: required(
      "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    ),
    storageBucket: required(
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    ),
    messagingSenderId: required(
      "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    ),
    appId: required("NEXT_PUBLIC_FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  };
}

export function vapidKey(): string {
  return required("NEXT_PUBLIC_FIREBASE_VAPID_KEY", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
}

/** reCAPTCHA v3 site key for Firebase App Check; optional in local/dev. */
export function appCheckSiteKey(): string | undefined {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
}

/** Whether Firebase can be initialized at all (emulator mode or a real web key
 * is present). Public pages must render even when auth is not yet configured. */
export function isFirebaseConfigured(): boolean {
  return useEmulator() || Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
}
