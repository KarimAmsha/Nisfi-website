# Nisfi — Phase Status and Resume Record

## Official resume rule

This file is the official record for resuming work, alongside `NISFI_MASTER_SPEC.md`, `docs/DECISIONS.md`, the actual repository state, and the owner's newest instruction. A unit may move forward only after explicit owner approval; silence is not approval.

## Current position

| Field | Value |
|---|---|
| Current phase | Phase 0 — Product foundation and approved design language |
| Current unit | Unit 0.1 — pnpm monorepo scaffold |
| Implementation state | Implemented; delivered on branch `claude/project-review-a9s1w1` for owner review |
| Owner approval date | Pending owner review |
| Previous unit | Unit 0.0 — closed and owner-approved on 2026-07-20 |
| Git delivery status | Unit 0.1 committed and pushed to `claude/project-review-a9s1w1`; not pushed to `origin/main` (phase-gate G0 push to `main` remains after full Phase 0 approval). |
| Reference | `NISFI_MASTER_SPEC.md`, Sections 4, 5, 15, and 16 |

## Unit 0.1 objective

Create the pnpm monorepo scaffold — `apps/web`, `functions`, and `packages/shared` — with strict TypeScript, shared lint/format/test tooling, and a single `pnpm check` gate, on the mandated Node 22 LTS + pnpm 11 runtime. No product features, Next.js routing, Firebase wiring, or design system are introduced (those belong to later approved units).

## Implemented scope

- Established a pnpm 11 workspace (`pnpm-workspace.yaml`) over `apps/*`, `packages/*`, and `functions`, with the exact package manager pinned in `packageManager` (`pnpm@11.15.1`) and Node 22 enforced via `engines` and `.nvmrc`.
- Added shared strict-TypeScript baseline (`tsconfig.base.json`) with `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, and related safety flags; each package extends it.
- Added repository-wide tooling: ESLint 10 flat config with type-aware `typescript-eslint`, Prettier, and Vitest, plus root scripts `typecheck`, `lint`, `format`/`format:check`, `test`, and the aggregate `check`.
- Scaffolded `packages/shared` (`@nisfi/shared`) with the shared `Locale` model (`ar`/`en`/`tr`, Arabic default and RTL) and a unit test.
- Scaffolded `apps/web` (`@nisfi/web`) with the mandated backend-agnostic layering directories — `core/domain`, `core/ports`, `core/usecases`, `infrastructure/firebase`, `app`, `components`, `lib` — documented boundaries, a seed that verifies `web → @nisfi/shared` wiring, and a unit test.
- Scaffolded `functions` (`@nisfi/functions`) as a Node 22 TypeScript package with a documented placeholder entry point and a unit test.
- Pinned exact dependency versions and captured a committed `pnpm-lock.yaml` for reproducible installs.

## Files created by Unit 0.1

| File / directory | Purpose |
|---|---|
| `package.json` (root) | Private workspace root; `packageManager`, `engines`, and `check`/`typecheck`/`lint`/`format`/`test` scripts. |
| `pnpm-workspace.yaml` | Workspace package globs. |
| `.npmrc`, `.nvmrc` | Install policy and Node 22 pin. |
| `tsconfig.base.json` | Shared strict TypeScript compiler options. |
| `eslint.config.mjs` | Flat ESLint config with type-aware linting. |
| `.prettierrc.json`, `.prettierignore` | Formatting config; approved Unit 0.0 prose excluded from reformatting. |
| `.gitignore` | Ignore dependencies, build output, coverage, and secrets. |
| `packages/shared/**` | `@nisfi/shared` scaffold: locale model + test. |
| `apps/web/**` | `@nisfi/web` scaffold: layering directories + wiring seed + test. |
| `functions/**` | `@nisfi/functions` scaffold: placeholder entry + test. |
| `pnpm-lock.yaml` | Reproducible dependency lock. |

## Explicitly not implemented

- No Next.js, next-intl, Tailwind, shadcn/ui, TanStack Query, react-hook-form, or Zod installation or routing (Unit 0.2 and later).
- No visual directions, design tokens, or design system (Units 0.3–0.4).
- No Firebase SDK, adapters, emulator configuration, App Check/env wiring, CI, or the `no-restricted-imports` Firebase boundary lint rule (Unit 0.5).
- No product data model, security rules, Cloud Functions handlers, or feature code.
- No Firebase project IDs, web config, VAPID key, service credentials, secrets, or deployment.
- No push to `origin/main` (reserved for the Phase 0 gate G0 after full owner approval).

## Verification evidence

| Check | Expected evidence | Result |
|---|---|---|
| Runtime policy | Node 22 LTS and pnpm 11 in use | Node `v22.22.2`, pnpm `11.15.1` |
| Clean install | Workspace installs reproducibly | `pnpm install --frozen-lockfile` succeeds |
| Typecheck | Strict TS passes in all packages | `pnpm run typecheck` passes |
| Lint | ESLint clean | `pnpm run lint` passes |
| Format | Prettier clean | `pnpm run format:check` passes |
| Tests | Package tests pass | `pnpm run test` — 5 tests across 3 packages pass |
| Aggregate gate | Unit acceptance | `pnpm check` passes |

## Next proposed unit — do not execute without approval

**Phase 0 / Unit 0.2: next-intl locale routing and semantic RTL/LTR base with a minimal route shell.**

Proposed outcome: install Next.js 16.x into `apps/web`, add next-intl `/[locale]/…` routing for `/ar`, `/en`, `/tr`, establish semantic RTL/LTR direction, and render a minimal route shell verified in Arabic (RTL) with working locale switching.

This is the next proposed unit only. It is not authorized to start until the owner gives explicit approval. No files for it were created by Unit 0.1.
