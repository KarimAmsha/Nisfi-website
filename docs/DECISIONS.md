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
