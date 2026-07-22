import { DEFAULT_LOCALE, type Locale } from "@nisfi/shared";

/**
 * Cloud Functions entry point (master spec Section 12), Node 22 + TypeScript.
 *
 * No `firebase-functions` / `firebase-admin` SDK is installed or wired in
 * Unit 0.1. Callable/triggered handlers (auth lifecycle, moderation, matching,
 * photo reveal, audit writes) are introduced in their approved work units.
 *
 * This seed consumes the shared package so the workspace dependency graph is
 * verified from the scaffold onward.
 */
export function serviceDefaultLocale(): Locale {
  return DEFAULT_LOCALE;
}

// CF6/CF7 connection-request enforcement cores (the deployed callables wrap
// them in transactions; SDK wiring is deferred to the production step, O-001).
export {
  evaluateSendRequest,
  evaluateTransition,
  type SendRequestReadState,
  type TransitionReadState,
} from "./connection-requests";
