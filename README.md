# Nisfi — نِصفي

Nisfi is a privacy-first, verification-first web platform for serious, marriage-intent matchmaking for Arabic-speaking Muslims worldwide. The product will support Arabic (the default, RTL), English, and Turkish.

> **Project status:** Phase 0 is in progress. Unit 0.0 (docs) was owner-approved on 2026-07-20; Unit 0.1 (pnpm monorepo scaffold) and Unit 0.2 (next-intl locale routing with RTL/LTR route shell) are implemented and delivered to `main` — see [`docs/PHASE_STATUS.md`](./docs/PHASE_STATUS.md) for the live state. The web app renders `/ar` (default, RTL), `/en`, and `/tr`. The repository still contains no Firebase configuration, no deployable service, and no product features beyond a minimal localized shell.

## Source of truth

[`NISFI_MASTER_SPEC.md`](./NISFI_MASTER_SPEC.md) is the binding product and execution specification. If any future implementation, document, or discussion conflicts with it, the owner must resolve the conflict before implementation proceeds.

## Current repository scope

Unit 0.0 documented the product foundation. Unit 0.1 added the pnpm monorepo scaffold (`apps/web`, `functions`, `packages/shared`) with strict TypeScript and shared ESLint/Prettier/Vitest tooling. Unit 0.2 added Next.js 16 + next-intl locale routing: `/ar` (default, RTL), `/en`, and `/tr` render a minimal, fully localized route shell with working locale switching. The Firebase SDK is **not** installed and no external service is connected.

Common commands (run from the repository root):

```bash
pnpm install        # install workspace dependencies
pnpm check          # typecheck + lint + format check + tests
pnpm --filter @nisfi/web dev     # run the web app locally
pnpm --filter @nisfi/web build   # production build of the web app
```

Unit 0.3 presented two visual directions; the owner selected **Direction A «وَقار»** (emerald + gold), now the binding system in [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md). (The pitch preview and the alternative «سَكينة» remain in [`docs/design/`](./docs/design).)

Unit 0.4 builds that system on the app: Tailwind v4 tokens, primitives (`src/components/ui`), and the member and admin shells (`src/components/shell`) with responsive navigation and localized state patterns. The member app renders at `/[locale]/app/*` and the admin console at `/[locale]/admin/*`.

Unit 0.5 establishes the Firebase boundary and foundation: the restricted-import ESLint rule (`firebase/*` only under `infrastructure/firebase/**`), emulator config (`firebase.json`, `.firebaserc`, `firestore.indexes.json`), baseline default-deny `firestore.rules`/`storage.rules` with passing emulator tests (`pnpm test:rules`), env-based client/admin init, and CI. Real cloud wiring closes Phase 0 (gate G0) once the owner provides Firebase config/credentials as environment secrets (see `docs/DECISIONS.md`, D-002).

```bash
pnpm test:rules     # run Firestore security-rules tests under the emulator (needs Java)
pnpm emulators      # start the Firebase emulators locally
```

## Approved technical baseline

The following baseline is specified by the master document and is recorded here for orientation only:

- Runtime policy: **Node.js 22 LTS** and **pnpm 11**.
- Web application: Next.js 16.x, App Router, and strict TypeScript.
- UI: Tailwind CSS and adapted shadcn/ui components.
- Localization: `next-intl` with `/ar`, `/en`, and `/tr` routes; Arabic is RTL by design.
- Backend services: Firebase Authentication, Cloud Firestore, Firebase Storage, Cloud Functions for Firebase (2nd gen, Node 22), Firebase Cloud Messaging, and Firebase App Check.
- Repository layout (created in Unit 0.1): `apps/web`, `functions`, and `packages/shared`.

The workspace pins `pnpm@11.15.1` in `packageManager` and pins exact dependency versions with a committed `pnpm-lock.yaml`.

## Architecture boundary

The future web application must preserve a replaceable backend boundary:

```text
apps/web/src/
  core/                 # domain types, ports, and use cases; no Firebase/Next imports
  infrastructure/
    firebase/           # the only web location allowed to import firebase/*
  app/                  # Next.js routes
  components/
  lib/
```

Future product code consumes domain ports rather than Firebase SDK types. Firebase imports outside `infrastructure/firebase/**` will be prohibited by linting when that tooling is introduced in Unit 0.5.

## Environment variables and secrets

Copy `.env.example` to `.env.local` only when an approved future unit requires local configuration. The example intentionally contains variable names without values.

- Never commit `.env.local`, service-account material, VAPID keys, signed URLs, personal verification media, or production identifiers.
- Firebase project IDs, web configuration, VAPID keys, service credentials, and deployment environments are owner-provided inputs required only when their relevant work unit is approved.
- Do not invent placeholder credentials or use production data for development or tests.

## Working agreement

Development proceeds one approved work unit at a time. Each unit is implemented, checked, presented for owner review, and then paused. No subsequent unit, commit, push, merge, pull request, or deployment is implied by completion of an earlier unit.

For the current status, evidence, and proposed next unit, see [`docs/PHASE_STATUS.md`](./docs/PHASE_STATUS.md). For approved baseline decisions and owner decisions still required, see [`docs/DECISIONS.md`](./docs/DECISIONS.md).
