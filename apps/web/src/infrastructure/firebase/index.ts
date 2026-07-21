/**
 * Firebase infrastructure layer (master spec Section 5.1).
 *
 * HARD RULE: this directory (`infrastructure/firebase/**`) is the ONLY place in
 * the web app where `firebase/*` may be imported — enforced by the ESLint
 * `no-restricted-imports` boundary rule. Product code consumes domain ports;
 * the concrete adapters that implement those ports (auth, profile, request,
 * match, chat, moderation, notification, storage, config) are added in their
 * approved feature units and live here.
 */
export {
  getFirebaseApp,
  ensureAppCheck,
  firebaseAuth,
  firebaseFirestore,
  firebaseStorage,
} from "./client";
export { firebaseConfig, vapidKey } from "./env";
