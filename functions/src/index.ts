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

// CF10 block enforcement core (SDK wiring deferred, O-001).
export { evaluateBlock } from "./blocks";

// CF7 accept → match-creation core and closeMatch core (SDK wiring deferred, O-001).
export { evaluateAccept, evaluateCloseMatch, type AcceptResult, type CloseResult } from "./matches";

// Chat onCreate core: moderation flag + match preview/unread (SDK wiring
// deferred, O-001).
export {
  evaluateMessageModeration,
  buildMatchUpdateOnMessage,
  type MessageModeration,
  type MatchUpdateOnMessage,
} from "./chat";

// Photo-reveal cores: setPhotoReveal + getRevealedPhotoUrls authorization
// (Cloudinary signing + SDK wiring deferred, O-001/O-002).
export { evaluateSetPhotoReveal, evaluateRevealAccess, type SetRevealResult } from "./reveal";

// Push cores: message-push throttle + invalid-token pruning (FCM/SDK wiring
// deferred, O-001).
export { shouldPushMessage, isInvalidTokenError, INVALID_TOKEN_CODES } from "./push";

// CF5 verification-decision core (Admin SDK + audit wiring deferred, O-001).
export { evaluateVerificationDecision, type DecideVerificationResult } from "./verification";

// decidePhoto core: photo moderation → publish blurred on approve (Cloudinary/
// SDK wiring deferred, O-001/O-002).
export { evaluatePhotoDecision, type DecidePhotoResult } from "./photos";

// Report transition + sanction cores (Admin SDK + audit wiring deferred, O-001).
export {
  evaluateReportTransition,
  evaluateSanction,
  type ReportTransitionResult,
  type SanctionResult,
} from "./reports";

// User-ops cores: role assignment (superAdmin) + account-status change
// (suspend/reinstate/ban) with token revocation (Admin SDK + audit wiring
// deferred, O-001).
export {
  evaluateRoleAssignment,
  evaluateStatusChange,
  type RoleAssignmentActor,
  type RoleAssignmentResult,
  type StatusChangeResult,
} from "./users";

// Content cores: compatibility-question write (validation + existing-answer
// impact) and reorder (admin-only; Admin SDK + audit wiring deferred, O-001).
export {
  evaluateQuestionWrite,
  evaluateQuestionReorder,
  type QuestionWriteResult,
  type QuestionReorderResult,
} from "./questions";

// App-config core: allow-listed flag/limit/content change with old→new audit
// (admin-only; Admin SDK + audit wiring deferred, O-001).
export { evaluateConfigChange, type ConfigWriteResult } from "./config";
