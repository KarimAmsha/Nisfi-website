# Nisfi — Decision Register

## Purpose and status

This is the durable decision register required by `NISFI_MASTER_SPEC.md`. It distinguishes the architecture and product constraints already mandated by the master specification from matters that remain deliberately undecided and require explicit owner approval.

**Rule:** a deferred item below is not permission to infer, implement, or silently choose it. Once the owner approves a material decision, record the decision, date, rationale, and affected work unit here before implementation.

## A. Decisions already mandated by the master specification

| ID | Decision | Status | Source / implementation boundary |
|---|---|---|---|
| A-001 | Nisfi is a privacy-first, verification-first platform for serious marriage-intent matchmaking, not a casual dating app or social network. | Mandated | Product vision and V1 scope in the master specification. |
| A-002 | V1 is a responsive web application with Arabic as the default RTL locale and English and Turkish as additional locales. | Mandated | All user-facing copy is localized; URLs use `/ar`, `/en`, and `/tr`. |
| A-003 | Runtime policy is Node.js 22 LTS with pnpm 11. | Mandated | Exact pnpm/package versions are intentionally not pinned until Unit 0.1. |
| A-004 | The repository will become a pnpm monorepo containing `apps/web`, `functions`, and `packages/shared`. | Mandated | Creation is deferred to Unit 0.1; these directories do not exist in Unit 0.0. |
| A-005 | The web stack is Next.js 16.x (App Router), strict TypeScript, Tailwind CSS, shadcn/ui, next-intl, TanStack Query, react-hook-form, and Zod. | Mandated | Dependencies are not installed in Unit 0.0. |
| A-006 | Firebase Authentication, Firestore, Storage, 2nd-gen Cloud Functions on Node 22, FCM, and App Check are the V1 service stack. | Mandated | No Firebase project, configuration, credentials, or wiring is created until an approved later unit. |
| A-007 | Product logic must be backend-replaceable through domain/ports/infrastructure layering; Firebase imports in the web app are allowed only under `infrastructure/firebase/**`. | Mandated | Lint enforcement is scheduled for Unit 0.5. |
| A-008 | Authentication, authorization, sensitive state changes, moderation, audit writes, matching, photo reveal, and sanctions require server-side enforcement; UI visibility is never authorization. | Mandated | Firestore/Storage rules and emulator tests will be introduced in their approved units. |
| A-009 | The role model is `user`, `moderator`, `admin`, and `superAdmin`; Firebase custom claims are authoritative. | Mandated | The mirrored user-document role is not an authorization source. |
| A-010 | Photos are blurred by default and original photos/selfies are never publicly readable. | Mandated | Reveal and moderation access must be server-authorized and short-lived where specified. |
| A-011 | The initial visual direction is not final. Premium, privacy-led, Arabic-first UX is mandatory; two polished directions require owner selection in Unit 0.3. | Mandated process | Do not invent a final logo or visual direction before that selection. |
| A-012 | Development is one approved work unit at a time, with owner review before the next unit. | Mandated process | This register and `docs/PHASE_STATUS.md` are the official continuity records. |

## B. Deferred owner decisions and external inputs

| ID | Decision or input required | Needed by | Current status / consequence |
|---|---|---|---|
| D-001 | Approved visual direction, logo/wordmark status, and whether a temporary text mark is acceptable. | Units 0.3–0.4 | Pending owner decision. No final branding or visual system may be assumed. |
| D-002 | Firebase development, staging, and production project IDs; web configuration; VAPID key; and server credentials through secure channels. | Unit 0.5 for real wiring | Pending owner input. Emulators can be prepared earlier; no secrets or identifiers are stored here. |
| D-003 | Firebase/Functions billing plan, budget alerts, and acceptable monthly guardrails. | Before paid staging resources or functions | Pending owner decision. No paid resource enablement or deployment is implied. |
| D-004 | Firestore, Storage, and Functions primary region plus data-residency choice. | Before permanent Firebase provisioning in Unit 0.5 | Pending owner decision after latency and legal review; the choice may be expensive to change. |
| D-005 | Domain/DNS and trademark or name review. | Units 7.5–7.7 | Pending owner input. No launch metadata should assume `nisfi.app` or another domain. |
| D-006 | Qualified legal review of terms, privacy, consent, retention, sensitive-data handling, and moderation policies for KVKK/GDPR and target markets. | Draft shells in Unit 1.2; approval before staging/launch | Pending legal/owner input. Any future legal page remains visibly draft until reviewed. |
| D-007 | Initial moderator/admin/superAdmin identities and secure bootstrap procedure. | Units 5.2 and 5.6 | Pending owner decision. Staff identities must never be hardcoded or granted client-side. |
| D-008 | Starter compatibility-question wording, cultural fit, answer types, and ordering in all three locales. | Review in Unit 2.3; seed in Unit 7.3 | Pending owner approval. |
| D-009 | Support/contact channels and response expectations. | Unit 1.2 and config seed | Pending owner input. Public support promises must match actual operations. |
| D-010 | Analytics/error-monitoring consent requirements and provider choice. | Unit 7.5 | Pending owner decision. No unapproved tracker or sensitive event payload may be introduced. |
| D-011 | Canonical handling of JPEG/PNG uploads when the specified final storage paths use `.webp`. | Unit 2.4 | Pending implementation decision. The owner should approve whether conversion happens client-side, server-side, or through an approved hybrid with byte validation. |
| D-012 | Truthful, cost-bounded calculation strategy for admin dashboard metrics and trends. | Unit 5.2 | Pending architecture decision. Production must not show placeholder metrics. |

## C. Decisions made in Unit 0.0

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U0-001 | Do not create a package manifest, runtime file, monorepo scaffold, dependency installation, Firebase config, or application directory in Unit 0.0. | Implemented under owner-approved scope | Keeps the preflight/documentation unit isolated from Unit 0.1 and later work. |
| U0-002 | Document Node.js 22 LTS and pnpm 11 in prose only; defer exact version pinning and `packageManager` to Unit 0.1. | Implemented under owner-approved scope | This matches the requested boundary and avoids creating `package.json` early. |
| U0-003 | Use `.env.example` as an empty-name template only. | Implemented under owner-approved scope | It communicates expected configuration without inventing or exposing values, IDs, keys, or credentials. |
| U0-004 | The owner approved and closed Phase 0 / Unit 0.0. | Owner-approved and closed on 2026-07-20 | Unit 0.1 remains proposed and requires separate explicit owner approval before it can begin. |

## D. Decisions made in Unit 0.1

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U1-001 | Pin the exact package manager `pnpm@11.15.1` in `packageManager` and enforce Node 22 via `engines`/`.nvmrc`. | Implemented under owner-authorized scope | Satisfies the mandated Node 22 LTS + pnpm 11 policy (A-003) with a reproducible, verifiable toolchain. |
| U1-002 | Pin exact tool versions (TypeScript 5.9.3, ESLint 10.7.0, typescript-eslint 8.64.0, Prettier 3.9.5, Vitest 4.1.10) and commit `pnpm-lock.yaml`. | Implemented under owner-authorized scope | Spec Section 4 requires exact pinning for reproducibility. TypeScript is held at 5.9.3 because the current `typescript-eslint` peer range excludes TypeScript 7; upgrading is a future tested decision. |
| U1-003 | Scaffold `apps/web`, `functions`, and `packages/shared` only, with strict TS, lint/format/test tooling and a single `pnpm check` gate; do not install Next.js, next-intl, or the Firebase SDK yet. | Implemented under owner-authorized scope | Keeps Unit 0.1 to the monorepo scaffold; Next.js routing (0.2) and Firebase boundary/lint enforcement (0.5) remain their own units per the one-unit cadence (A-012). |
| U1-004 | Establish the backend-agnostic layering directories (`core/domain`, `core/ports`, `core/usecases`, `infrastructure/firebase`, `app`, `components`, `lib`) with documented boundaries but no product entities. | Implemented under owner-authorized scope | Encodes the mandated replaceable-backend architecture (A-007) from the first scaffold without pre-implementing feature data models. |
| U1-005 | Exclude the owner-approved Unit 0.0 prose (`NISFI_MASTER_SPEC.md`, `README.md`, `docs/`) from Prettier reformatting. | Implemented under owner-authorized scope | Prevents automated formatting from altering approved/binding content while still enforcing formatting on code. |

## E. Decisions made in Unit 0.2

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U2-001 | Install Next.js 16.2.10, React 19.2.7, and next-intl 4.13.2 (pinned exactly); defer Tailwind/shadcn to the design-system units. | Implemented under owner-authorized scope | Delivers the locale routing + RTL/LTR base without pulling design-system work (Units 0.3–0.4) into this unit. |
| U2-002 | Reuse the shared `Locale` model (`LOCALES`, `DEFAULT_LOCALE`) from `@nisfi/shared` as the single source for next-intl routing. | Implemented under owner-authorized scope | Keeps locales consistent across web, functions, and routing (spec Sections 4, 13). |
| U2-003 | Name the locale middleware `proxy.ts`. | Implemented under owner-authorized scope | Matches the master spec's `proxy.ts` (Section 9) and Next.js 16's renamed middleware entry point. |
| U2-004 | Self-host IBM Plex Sans Arabic (Arabic) and Inter (Latin) via `next/font`. | Implemented under owner-authorized scope | Satisfies the Section 13 font requirement; `next/font` self-hosts the assets. |
| U2-005 | Keep all UI copy in `messages/{ar,en,tr}.json`; no hardcoded strings in components. | Implemented under owner-authorized scope | Enforces the Section 13 localization rule from the first rendered surface. |
| U2-006 | Deliver each completed unit to `main` (fast-forward) in addition to the working branch. | Implemented per explicit owner instruction (2026-07-21) | The owner directed that all work land on `main`. |

## F. Decisions in Unit 0.3

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U3-001 | Present two distinct visual directions — «وَقار» (emerald + gold, institutional) and «سَكينة» (teal-slate + clay, serene) — on the real landing, a member surface, and an admin surface, in Arabic RTL + an LTR sample. | Implemented per owner instruction (2026-07-21) | Fulfils the Section 14.2 design gate; gives the owner two genuinely different, on-brand options to select or combine. |
| U3-002 | Deliver the directions as a self-contained HTML preview plus a rationale doc under `docs/design/`, and NOT build product UI or finalize `docs/DESIGN_SYSTEM.md` yet. | Implemented per owner instruction | The spec makes `DESIGN_SYSTEM.md` binding only after selection; keeping the pitch separate avoids committing the product to an unapproved direction. |
| U3-003 | Preview fonts use a system Arabic/Latin stack because the HTML preview cannot load network fonts; the product itself uses self-hosted IBM Plex Sans Arabic + Inter (already wired in Unit 0.2). | Implemented | Honest constraint; does not change the intended product typography. |
| D-001 | Approved visual direction and logo/wordmark status. | **Resolved 2026-07-21 — Direction A «وَقار».** | Owner selected Direction A; recorded as binding in `docs/DESIGN_SYSTEM.md`. Temporary «نِصفي» text wordmark used until a final logo is provided. |

## G. Decisions in Unit 0.4

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U4-001 | Use Tailwind CSS v4 with CSS-first `@theme` tokens for the Waqār system. | Implemented under owner-authorized scope | Matches the mandated Tailwind stack (Section 4); tokens live in one place and drive utilities. |
| U4-002 | Hand-build shadcn-style primitives (cva + tailwind-merge) and a small internal outline icon set instead of running the shadcn CLI or adding an icon dependency. | Implemented under owner-authorized scope | Offline-safe and fully controlled; still yields adapted, tokenised primitives and one coherent icon family (Section 14.3/14.5). |
| U4-003 | Build member and admin shells with responsive navigation and populate a minimal set of surfaces with sample content and localized state patterns; no feature data, auth, or Firebase. | Implemented under owner-authorized scope | Satisfies the Unit 0.4 acceptance (shells, nav, states, visual gate) without pre-building later units. |
| U4-004 | Keep the temporary «نِصفي» text wordmark (no final logo yet). | Implemented; pending final logo from owner | D-001 left the logo open; a text mark is acceptable in the interim per the master spec. |

## H. Decisions in Unit 0.5

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U5-001 | Implement the Firebase boundary as env-based init modules under `infrastructure/firebase/**` (web) and `functions/src/firebase.ts` (admin); credentials read from environment only, never hardcoded or committed. | Implemented under owner-authorized scope | Satisfies Section 4/5.1 (replaceable backend, secrets never in code). |
| U5-002 | Write baseline default-deny Firestore/Storage rules encoding the shared predicates and core invariants now; expand per-collection rules and the full Section 11.4 matrix in each feature unit. | Implemented under owner-authorized scope | Matches the master spec's phased plan (e.g. profile rules in Unit 2.1) while enforcing the non-negotiable invariants (owner-only user docs, functions-only audit, originals never client-readable) from the start. |
| U5-003 | Run security-rules tests under the Firestore emulator via a dedicated `test:rules` script (kept out of `pnpm check`); verify with `demo-nisfi`. | Implemented under owner-authorized scope | Proves "emulators start" and the rules pipeline without secrets; keeps the default quality gate fast and emulator-free. |
| D-002 | Firebase project IDs, web config, VAPID key, App Check site key, and server credentials. | **Partially provided; action required.** | Project id `nisfi-d9db1` known. Real wiring still needs the web config + reCAPTCHA site key and rotated server credentials as environment secrets. |
| U5-004 | **Security incident:** a live service-account private key (`…357daad54d`) was shared through the chat/upload on 2026-07-21. | **Owner accepted the risk and will rotate later.** | The key was NOT stored in the repository and was not used for wiring. It must be revoked in Firebase/GCP IAM and replaced with an environment secret before any real deployment. |

## I. Owner directives — 2026-07-21 (override the master spec where noted)

| ID | Decision | Status | Rationale / impact |
|---|---|---|---|
| O-001 | All real API keys, secrets, and production wiring (Firebase config/credentials, image-platform keys, deployment) are deferred to a **single final "production wiring" step**. Feature units are built and verified against emulators/mocks until then. | Owner-directed 2026-07-21 | Lets development proceed without handling live secrets. Phase gates that require an "emulator end-to-end path" are still met via the Auth/Firestore emulators; real-project connection and deploy happen once at the end. |
| O-002 | **User images move off Firebase Storage (paid Blaze) to a free platform — Cloudinary** — for original photos, server-derived blurred views, and verification selfies. This overrides master spec Section 4 / 10.14 / 11.3 for image storage. Firebase still provides Auth, Firestore, Cloud Functions, FCM, and App Check. | Owner-directed 2026-07-21 (overrides spec) | Cost: avoids the paid Storage plan. The privacy contract is preserved and simplified: Cloudinary **private/authenticated delivery** means originals are never publicly readable; the public "blurred" view is an on-the-fly `e_blur`/`e_pixelate` transformation; photo **reveal** uses short-lived **signed URLs**; uploads are validated server-side. The `StorageService` port stays backend-agnostic — the adapter targets Cloudinary instead of Firebase Storage. Firebase `storage.rules` remain default-deny (unused for photos). Supersedes/So resolves D-011 (webp conversion is handled by Cloudinary transformations). |

## J. Decisions in Unit 3.1 (Discovery query model)

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U31-001 | Put the discovery **eligibility predicate, filter shape, and page-selection** in `@nisfi/shared` (`discovery.ts`) as pure, backend-agnostic logic; the Firestore adapter builds on the same functions. | Implemented under owner-authorized scope | Makes "pagination and exclusion logic demonstrated with seeded users" (3.1 acceptance) unit-testable without Firestore, and keeps the query plan replaceable (Section 5.1). |
| U31-002 | Implement the Section 10.15 **deterministic query plan** in the adapter: push mandatory eligibility (opposite gender, verified, visible) + sort into the indexed Firestore query, then scan bounded batches and post-filter facets + per-viewer block/match exclusions via `selectDiscoveryPage`, up to a read cap. | Implemented (query wiring exercised against real data in the deferred production step, O-001) | Avoids index explosion on disjunctive filters; never post-filters only the first batch or implies a fake total. |
| U31-003 | Expose a **stable cursor** = `{sortKey, uid}` and never surface an exact result count. `exhausted` is true only when the whole stream is scanned; a capped scan reports "more may exist". | Implemented | Section 10.15: cursor stability + honest completeness signalling. |
| U31-004 | Tighten `profiles/{uid}` read: a non-owner/non-staff active member may read only a **visible AND verified** profile (owner/staff unchanged). Gender/block/match exclusions stay in the query + Functions; block-based read denial arrives with the block foundation (Unit 3.6). | Implemented under owner-authorized scope | Section 11.4 ("eligible/visible") without per-doc reads that rules can't afford. |
| U31-005 | **Rules bug fix:** `role()` read `request.auth.token.role` directly, which throws for members without the custom claim in the current emulator; changed to `request.auth.token.keys().hasAny(['role']) ? … : 'user'`. Also set `fileParallelism:false` in the rules vitest config so files sharing the demo project stop clearing each other's seed data. | Implemented under owner-authorized scope | Fixes two pre-existing false-negative/flaky rules tests; positive staff/owner reads now pass deterministically (27 rules tests green). |
| D-013 | The composite indexes and adapter use the **canonical nested** `verification.status` (and computed `age`, `lastActiveAt`) from master spec Section 10.2, while the Unit 2.1 stored profile currently uses a flat `verificationStatus` and no `age`/`lastActiveAt`. | **Open — reconcile in production wiring (O-001).** | The publish/verification Cloud Functions will maintain the canonical server-managed fields (`verification.status`, `age`, `lastActiveAt`, mirrored `active`) that discovery queries and indexes depend on; the profile-write path stays client-field-locked. Rules use the flat field until the Functions land. |

### Unit 3.2 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U32-001 | Build the discovery surface as a client `DiscoveryBrowser` that consumes the `DiscoveryRepository` port; a preview seed (8 members) runs through the same `selectDiscoveryPage` logic when Firebase is unconfigured, marked with a visible preview badge. | Implemented under owner-authorized scope | Makes the cards/filters/pagination demonstrable and honest before wiring (O-001), with no divergent code path — only the data source differs. |
| U32-002 | Persist filters to `localStorage`; real per-user persistence to `users.settings.discoveryFilters` is deferred to wiring. | Implemented (persistence to Firestore deferred, O-001) | Same pattern as the resumable onboarding draft; keeps the feature usable offline/preview. |
| U32-003 | The connection-request CTA on a card is a **disabled affordance** (with an explanatory title) in 3.2; the request composer + server enforcement is Unit 3.4. | Implemented under owner-authorized scope | Honest UI — no non-functional button that appears to send; matches the phase plan. |
| U32-004 | Country filter is a single text field mapping to the multi-valued `countries` facet for v1; a full multi-country add/remove widget can follow if the owner wants it. | Implemented under owner-authorized scope | Keeps the filter sheet simple while the schema already supports multiple; low-risk to extend later. |

### Unit 3.3 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U33-001 | Profile detail reuses `PublicProfile` (via `ProfileRepository.getPublic`) rather than a new port method; eligibility is enforced by the tightened `profiles/{uid}` read rule, so an ineligible/absent read surfaces as an "unavailable" state. | Implemented under owner-authorized scope | Avoids a redundant port; keeps authorization server-side (A-008). |
| U33-002 | Protected media is shown as lock placeholders whose count comes from approved photo metadata; originals are never fetched client-side. In preview a fixed per-member count is used. | Implemented (real counts + Cloudinary deferred, O-001) | Satisfies "only public data and blurred assets are reachable" (3.3 acceptance) without exposing originals. |
| U33-003 | Preview profiles synthesise a `birthDate` from the seed's `age` so the detail derives age the same way real profiles do. | Implemented | Display parity between preview and production; no separate age path. |

### Unit 3.4 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U34-001 | The send decision (`canSendRequest`) lives in `@nisfi/shared` and is consumed by BOTH the client preflight and the CF6 transaction core (`functions/src/connection-requests.ts`), so the two can never drift. | Implemented under owner-authorized scope | Single source of truth for eligibility/dedupe/cooldown/limits; server stays authoritative. |
| U34-002 | `connectionRequests/{id}` is **read-only to clients** (participants + staff read; no client create/update/delete). All creation and transitions go through Cloud Functions (CF6/CF7) via the Admin SDK. | Implemented under owner-authorized scope | Master spec F5/11.4/12: limits, dedupe, cooldown, and match creation must be atomic and unforgeable. |
| U34-003 | The CF6 callable + counter writes (`pendingSent`/`sentToday`) and the scheduled expiry (CF14) are written as SDK-free logic now; the `firebase-functions`/`firebase-admin` wiring + deploy is deferred to the production step (O-001). | Implemented (SDK wiring deferred) | Keeps enforcement reviewable and unit-tested without installing/serving the Functions runtime here. |
| U34-004 | The composer sends via the CF6 callable in configured mode and simulates an honest outcome in preview; a shared-decision preflight surfaces localized denial reasons before a doomed send. | Implemented under owner-authorized scope | Good UX without duplicating server logic; preview stays truthful (no fake network send). |

### Unit 3.5 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U35-001 | The transition rule (`canTransitionRequest`) lives in `@nisfi/shared` and is consumed by the client UI (optimistic update) and the CF7 core (`evaluateTransition`), matching the 3.4 pattern for the send rule. | Implemented under owner-authorized scope | One authority for who may accept/decline/withdraw and when; server stays canonical. |
| U35-002 | Transitions are executed only by CF7 callables (accept/decline/withdraw) via the Admin SDK; `matches/{pairKey}` creation on accept is atomic inside that transaction (Unit 4.1). Client `connectionRequests` writes remain denied by rules. | Implemented (SDK wiring deferred, O-001) | Master spec F5/12: state, counters, and match creation must be transactional and unforgeable. |
| U35-003 | Expiry (`isRequestExpired`, 14 days) is a pure helper the scheduled function (CF14) uses; no client role. | Implemented (scheduler deferred, O-001) | Keeps the expiry boundary unit-tested now. |
| U35-004 | The request center resolves counterparty display names from the discovery preview in preview mode and shows a neutral "verified member" label otherwise; a lightweight per-counterparty public-profile fetch can be added when the backend is wired. | Implemented under owner-authorized scope | Demonstrable UX now without an N+1 profile fetch; honest placeholder in configured mode until wiring. |

### Unit 3.6 additions (closes Phase 3 / gate G3)

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U36-001 | Blocks are stored at `blocks/{uid}/blocked/{targetUid}` and are **read-only to the owner**; block/unblock go through CF10 callables (Admin SDK), which also close any active match. Discovery already excludes blocked members both directions via the viewer's pre-unioned `blockedUids`. | Implemented (SDK wiring deferred, O-001) | Master spec F6/11.4: instant, unilateral, silent; unforgeable; consistent with the discovery eligibility from Unit 3.1. |
| U36-002 | Notifications are created only by Cloud Functions; the owner reads and may flip only `read`. Copy is carried as i18n `titleKey`/`bodyKey` + `params` and resolved client-side against a `NotificationCatalog` namespace. | Implemented under owner-authorized scope | Localized, server-agnostic copy (Section 13/10.8); the rule already existed and is now covered by tests. |
| U36-003 | The unread badge is derived on the client from the notifications list (`unreadCount`); a dedicated counter/denormalized field can be added if read cost warrants it during wiring. | Implemented under owner-authorized scope | Simple and correct for launch volumes; avoids a premature counter. |

## K. Decisions in Phase 4

### Unit 4.1 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U41-001 | The match document is built by a shared `buildAcceptedMatch` keyed by `pairKey`; the CF7 accept transaction (`evaluateAccept`) writes it and flips the request in one atomic step. Clients can never create matches (`matches` writes denied by rules). | Implemented (SDK wiring deferred, O-001) | Master spec F6/10.5/12: match id = pairKey makes accept idempotent and unforgeable. |
| U41-002 | The match list queries active matches via the existing `matches` composite index (uids CONTAINS + status + lastMessageAt DESC); closed-match history is surfaced with the close flow (Unit 4.3). | Implemented under owner-authorized scope | Uses the index from Unit 0.5 without adding a new one; scopes 4.1 to the primary list. |
| U41-003 | `/app/matches/[id]` ships as an honest "chat coming next" placeholder so match links resolve rather than 404; the real-time conversation is Unit 4.2. | Implemented under owner-authorized scope | Keeps navigation truthful between units without pre-building chat. |

### Unit 4.2 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U42-001 | Messages are created directly by active participants under `matches/{pairKey}/messages` (gated by rules that verify membership via a `get()` on the parent match, the exact schema, and `match.status == active`); the sender may soft-delete only their own within 15 min. Moderation flags, preview, and unread are server-managed. | Implemented (Function triggers deferred, O-001) | Master spec F6/11.4: real-time chat needs client writes, but the shape, membership, and window are unforgeable. |
| U42-002 | The banned-word check is a shared `containsBannedWord` used as a client pre-check (with a small demo list in preview; the real list is `appConfig.bannedWords`), while the server re-checks and sets `moderation.flagged` authoritatively; flagged messages still deliver in V1. | Implemented (appConfig wiring deferred, O-001) | Matches the spec's two-layer moderation; keeps the client honest without trusting it. |
| U42-003 | Typing indicators and read receipts are intentionally omitted (out of V1); unread counts only. | Implemented (by omission) | Explicit master spec F6 scope boundary. |

### Unit 4.3 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U43-001 | Close-match is a server transition (`closeMatch` callable via `evaluateCloseMatch`); the client optimistically reflects the closed state but the match doc write is server-only. A closed match keeps message history read-only and blocks new sends (the message-create rule already requires `match.status == active`). | Implemented (SDK wiring deferred, O-001) | Master spec F6: closing must be atomic and unforgeable, and history must remain. |
| U43-002 | The soft-delete affordance (own message, 15-min window) shipped in 4.2 is retained; 4.3 adds the close flow and the closed/empty/loading conversation states. | Implemented under owner-authorized scope | Keeps the conversation states robust without re-litigating soft-delete. |

### Unit 4.4 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U44-001 | Photo reveal is per-side and revocable (`matches.photoReveal[uid]`); the flag is set via the `setPhotoReveal` callable (match writes are server-only), and originals are fetched only through `getRevealedPhotoUrls`, which enforces membership + the counterparty's reveal flag and returns short-lived signed Cloudinary URLs. | Implemented (Cloudinary signing + SDK wiring deferred, O-001/O-002) | Master spec F7: originals never public, never cached in Firestore; revoke denies the next request. |
| U44-002 | The reveal-relevant pure helpers accept a loosened structural match projection (`{ uids: readonly string[]; … }`) so both the web client and the Function cores share them without tuple friction. | Implemented under owner-authorized scope | Keeps one authority for reveal access across surfaces. |
| U44-003 | In preview the counterparty is seeded as having revealed, so both the "reveal mine" toggle and the "they revealed" state are demonstrable; revealed originals show a signed-link placeholder until Cloudinary is wired. | Implemented (originals deferred, O-002) | Honest, demonstrable UX without exposing any real originals. |

### Unit 4.5 additions (closes Phase 4 / gate G4)

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U45-001 | Web-push permission is requested only on an explicit user action (the `PushPrompt` Enable button on `/app/notifications`), never on load; in-app notifications never depend on push. | Implemented under owner-authorized scope | Master spec F9: permission timing after a meaningful action, not on page load. |
| U45-002 | FCM tokens live as private per-device docs under `users/{uid}/devices/{deviceId}` (owner-only rules); a Function prunes them on invalid-token FCM errors (`isInvalidTokenError`). | Implemented (FCM/SDK wiring deferred, O-001) | Token privacy + a self-healing token lifecycle. |
| U45-003 | Message push is throttled to ≤1 per match per 5 minutes (`shouldSendMessagePush`), enforced server-side; the in-app center is always updated. | Implemented (trigger wiring deferred, O-001) | Master spec F9 throttle; avoids push spam while keeping the in-app record complete. |

## L. Decisions in Phase 5

### Unit 5.1 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U51-001 | A single role ordering lives in `@nisfi/shared` (`role.ts`, `roleAtLeast` etc.), consumed by the web console gating and the Functions; the security rules mirror the same order. Console gating is UX only — the rules remain the authorization boundary (A-008). | Implemented under owner-authorized scope | One source of truth for roles across surfaces; server stays authoritative. |
| U51-002 | The dashboard counts only what is staff-readable now (pending verifications via `getCountFromServer`); photo/report queues count 0 until their units (5.2/5.3) rather than displaying invented numbers. | Implemented under owner-authorized scope | Honest, audit-safe reads; no fabricated operational figures. |
| U51-003 | System-health tiles are shown as "pending wiring" until the production step; real health probes connect with O-001. | Implemented (health probes deferred, O-001) | Truthful console without fake green checks. |

### Unit 5.2 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U52-001 | The verification decision authority (`canDecideVerification` + `verificationOutcome`) lives in `@nisfi/shared` and is consumed by the CF5 core (`evaluateVerificationDecision`); the console calls the `decideVerification` callable. Client writes to `verificationRequests` decisions stay denied by rules. | Implemented (Admin SDK + audit wiring deferred, O-001) | Master spec F3/12: decisions are server-only, transactional, mirrored to the profile, notified, and audited. |
| U52-002 | Selfie/ID evidence is shown as a private placeholder in the console; the real image loads via a short-lived staff-authorized URL, never stored in Firestore or made public. | Implemented (Cloudinary staff-URL signing deferred, O-002) | Master spec F3: verification media is sensitive and never member-visible. |
| U52-003 | The queue lists only pending requests (oldest-first via the existing index) and decisions optimistically remove the item; a demo seed keeps the console reviewable in preview. | Implemented under owner-authorized scope | Focused, audit-safe reviewer workflow. |

### Unit 5.3 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U53-001 | Photo decisions use a shared authority (`canDecidePhoto` + `photoModerationOutcome`); the CF `decidePhoto` core (`evaluatePhotoDecision`) sets the moderation state and, only on approve, `publishBlurred: true`. A rejected photo is never published; originals are never staff-cached. | Implemented (Cloudinary/SDK wiring deferred, O-001/O-002) | Master spec F8/F7: the blurred variant becomes readable only after approval; originals stay private. |
| U53-002 | The queue is a staff collection-group read of pending photos under `profiles/{uid}/photos`; it reads empty when configured until the photo-metadata collection + index + Cloudinary land (O-002), with a preview seed keeping the console reviewable. | Implemented (photo metadata deferred, O-002) | Honest, audit-safe reads consistent with the deferred media stack. |

### Unit 5.4 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U54-001 | Report creation is a member write with the exact `open` shape enforced by rules (`reporterUid == self`, `targetUid != self`, active member); triage transitions and sanctions are server-only (client update/delete denied). The decision authority lives in `@nisfi/shared` (`canCreateReport`, `canTransitionReport`, `canApplySanction`) so client preflight and server enforcement never drift. | Implemented (CF callables deferred, O-001) | Master spec F8/A-008: members can flag, but state changes and sanctions are audited server actions. |
| U54-002 | `canApplySanction` gates ban to admin+ and every other sanction (warn/unpublish/suspend/dismiss) to any staff; `sanctionAccountStatus` maps suspend→`suspended`, ban→`banned`. The CF `applySanction` core (`evaluateSanction`) writes `users.status` (rules-enforced) and an audit record. | Implemented (CF + audit wiring deferred, O-001) | Master spec F8/11: proportional, role-gated, audited enforcement. |
| U54-003 | `AdminRepository.listReports` reads open reports oldest-first (a fair moderation FIFO) via the `reports` composite index (status ASC, createdAt ASC); it reads empty when configured until reports accrue, with a preview seed keeping the console reviewable. | Implemented | Honest, index-backed reads consistent with the rest of the console. |

### Unit 5.5 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U55-001 | Role assignment is superAdmin-only and never on oneself (`canAssignRole`); the custom claim is authoritative and the `users.role` Firestore field is a read-only mirror. Account-status changes (`canSetAccountStatus`): suspend/reinstate are admin+, a ban and lifting a ban are superAdmin-only, and staff cannot act on themselves or a peer at/above their own rank. The decision authority lives in `@nisfi/shared` so console gating and server enforcement never drift. | Implemented (CF callables deferred, O-001) | Master spec Sections 6/F10/11: least-privilege, self-lockout-safe, audited role/status control. |
| U55-002 | Locking a member out (suspend/ban) revokes their refresh tokens (`revokeTokens` from the CF core) so open sessions can't outlive the sanction; reinstating does not. Suspended/banned members are already denied member surfaces by the rules' `isActive()` predicate (profiles, verification, reports), satisfying Gate G5's lockout without new rule branches. | Implemented (token revocation wired at production, O-001) | Master spec Gate G5: server/rules — not UI — lock out sanctioned members, promptly. |
| U55-003 | The preview (unconfigured) admin console assumes a **superAdmin** actor so the full owner walkthrough — including role assignment and bans — is reviewable from seeds; live sessions still use the real custom-claim role. | Implemented | Gate G6's "owner control-panel walkthrough" needs every capability visible in preview; production gating is unchanged. |

### Unit 6.1 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U61-001 | Compatibility questions live in `questionBank/{id}`: any signed-in member reads them (the onboarding wizard renders the set before a profile is complete), and all writes are server-only (admin via a content Cloud Function + audit). The decision authority (`canManageQuestions` admin+, `questionInputSchema`, `reorderQuestions`, `isBreakingQuestionChange`) lives in `@nisfi/shared` so console gating and server validation never drift. | Implemented (CF callables deferred, O-001) | Master spec Section 6.1/F10: content is admin-managed, validated, and audited; members only read. |
| U61-002 | Edits are validated for full localization (ar/en/tr on the question and every option) and a 2-option minimum; an edit that removes an option or archives an active question is flagged `affectsExistingAnswers` so the console warns before saving (answers are not silently orphaned). | Implemented | Master spec 6.1 acceptance: validation + existing-answer impact warning. |
| U61-003 | Reordering swaps siblings and renormalizes `order` to a 1-based sequence server-side (`reorderQuestions`), so ordering stays gap-free and deterministic regardless of the client's optimistic view. | Implemented | Stable, predictable question order for onboarding. |

### Unit 6.2 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U62-001 | Runtime config lives in a single member-readable `appConfig` surface and is server-only to write (admin via a content CF + audit). Only allow-listed keys exist — flags (`CONFIG_FLAGS`), bounded tunables (`CONFIG_LIMITS`), and localized content blocks (`CONTENT_BLOCKS`); `validateConfigChange` rejects unknown keys, out-of-range numbers, and malformed/overlong content. The authority lives in `@nisfi/shared` so client preflight and server enforcement never drift. | Implemented (CF callable deferred, O-001) | Master spec Section 6.2: allow-listed config only; unsafe values rejected. |
| U62-002 | Every accepted change returns its dotted `path` plus `before`/`after` (`evaluateConfigChange`) so the deployed callable writes an immutable old→new audit event alongside the value. | Implemented (audit write deferred, O-001) | Master spec 6.2 acceptance: old/new audit on config changes. |
| U62-003 | `DEFAULT_APP_CONFIG` is the fallback the app and adapter merge over, so a missing document or key reads a safe default rather than `undefined`; this also lets pre-auth flags (e.g. `signupsEnabled`) degrade safely while the real gate stays server-side. | Implemented | Config must never hard-depend on the document existing; safe degradation. |

### Unit 6.3 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U63-001 | Broadcasts are admin+ only (`canSendBroadcast`) and server-only to write; the console reads them, and a Cloud Function composes/dispatches with audit. The audience is allow-listed (`BROADCAST_AUDIENCES`) and suspended/banned members never receive a broadcast (`matchesAudience`). The authority lives in `@nisfi/shared` so the dry-run count and the server's fan-out agree. | Implemented (CF callables deferred, O-001) | Master spec Section 6.3: authorized, localized, audited broadcasts to a defined audience. |
| U63-002 | Sending is idempotent (`canDispatch` — only `draft`/`failed` may dispatch; `sending`/`sent` are refused as `alreadyDispatched`), so a double-submit or retry never double-sends. `summarizeDelivery` marks a broadcast `sent` only when every recipient succeeded, otherwise `failed` — partial delivery is surfaced, not hidden. | Implemented (batched fan-out deferred, O-001) | Master spec 6.3 acceptance: idempotency + honest failure-path handling. |
| U63-003 | The composer requires a fully-localized message (ar/en/tr title ≤80, body ≤600) and a dry-run of the audience before the send button enables, and the send itself is gated behind an explicit confirm — a high-impact action is never one accidental click. | Implemented | Master spec 6.3: audience dry-run before sending; localization completeness. |

### Unit 6.4 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U64-001 | V1 ships a single `free` plan (`FREE_PLAN`) granting the default config limits, and every member holds a `users.entitlements` record (seeded at bootstrap). The plans catalog is member-readable; `plans` and `users.entitlements` are server-only to write. All runtime limit checks read from entitlements so V2 only has to add payment + entitlement updates. | Implemented (CF grant deferred, O-001) | Master spec 10.11–10.12: entitlement-driven limits from V1, billing added later without rework. |
| U64-002 | `subscriptionsEnabled` is added to the config allow-list and stays **false** in V1. A manual entitlement grant is superAdmin-only **and** permitted only while subscriptions are off (`canGrantEntitlement`); when billing is later enabled, that manual path closes and billing owns entitlement changes. Every grant is audited. | Implemented | Master spec 6.4: subscription flag stays off; controlled, superAdmin-only, audited manual management. |

### Unit 6.5 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U65-001 | `auditLogs` is superAdmin-only to read, immutable, and Functions-only to append (no client write or delete). Sensitive metadata is redacted before display (`redactAuditMetadata` recursively replaces token/secret/email/phone/etc. values with `[redacted]`), so a viewer never sees identifiers even if an event stored them. | Implemented (audit append deferred, O-001) | Master spec 6.5/10.11: immutable audit trail with metadata redaction. |
| U65-002 | Exports run against an allow-listed set of operational tables, are admin+ and server-validated (`validateExportRequest`), capped at `EXPORT_ROW_LIMIT`, exclude per-table sensitive columns by default, and are audited. CSV is RFC-4180 escaped. There is no unrestricted database-dump UI. | Implemented (CF18 deferred, O-001) | Master spec 6.5: privacy-safe, bounded, audited exports; no raw dumps. |
| U65-003 | `systemHealth` is a sanitized, staff-readable, Functions-written summary — env/release labels, an overall status derived from per-subsystem checks, and short non-sensitive notes only (`buildHealthSummary` drops any other fields). It carries no tokens, stack traces, provider secrets, or personal data, and is explicitly not a replacement for provider monitoring. | Implemented (CF20 deferred, O-001) | Master spec 6.5/10.11: staff-visible sanitized health, no secrets. |

### Unit 6.6 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U66-001 | The admin console uses a desktop sidebar (`md+`) and a mobile overlay drawer (below `md`) sharing one nav list, replacing the previous crowded horizontal-scroll nav. The drawer is fully keyboard-accessible (skip link, `aria-expanded`/`aria-controls`, focus-on-open, Escape/backdrop/navigation close) and RTL-correct (anchors to the inline-start, slides from the right in Arabic). | Implemented | Master spec 6.6 / Gate G6: tablet/mobile-safe access, keyboard triage, RTL/LTR QA. Phase 6 (control panel) closed. |

### Unit 7.1 additions

| ID | Decision | Status | Rationale |
|---|---|---|---|
| U71-001 | Member notification preferences and communication locale live on the owner-writable `users.preferences` / `users.locale` (the rules already allow exactly those keys), so the settings surface persists via direct owner writes — no Cloud Function needed. Profile visibility remains a `profiles.visibility` write via `saveOwn`. `mergeMemberPreferences` defaults every category to on, so a member opts out, never in. | Implemented | Master spec Section 7: least-surprise, owner-controlled preferences without extra server round-trips. |
| U71-002 | Data export and account deletion are privacy-rights actions handled server-side (`requestDataExport` / `requestAccountDeletion` callables), never a client write, and are gated behind an explicit in-app confirm. Unit 7.1 surfaces the entry points + a working sign-out; the actual export bundle and the verified, grace-period deletion cascade are Unit 7.2. | Implemented (CF flow deferred to 7.2 / O-001) | Master spec Section 7: privacy rights are verified, audited, server-owned; the UI must not fake them. |
