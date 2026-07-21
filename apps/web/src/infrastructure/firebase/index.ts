/**
 * Firebase infrastructure layer (master spec Section 5.1).
 *
 * HARD RULE: this directory (`infrastructure/firebase/**`) is the ONLY place in
 * the web app where `firebase/*` may be imported. Adapters implement the port
 * contracts from `core/ports` and convert SDK types (e.g. `Timestamp`) to
 * domain types at this boundary.
 *
 * No Firebase SDK is installed or wired in Unit 0.1. The adapters
 * (auth.service, profile.repository, request.repository, match.repository,
 * chat.repository, moderation.repository, notification.service, storage.service,
 * config.repository) and the restricted-import lint rule arrive in Unit 0.5.
 */
export {};
