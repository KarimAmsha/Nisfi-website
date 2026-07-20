# Nisfi — Phase Status and Resume Record

## Official resume rule

This file is the official record for resuming work, alongside `NISFI_MASTER_SPEC.md`, `docs/DECISIONS.md`, the actual repository state, and the owner's newest instruction. A unit may move forward only after explicit owner approval; silence is not approval.

## Current position

| Field | Value |
|---|---|
| Current phase | Phase 0 — Product foundation and approved design language |
| Current unit | Unit 0.0 — Repository preflight, architecture confirmation, runtime policy, and baseline documentation |
| Implementation state | Completed and owner-approved |
| Owner approval date | 2026-07-20 |
| Unit closure | Unit 0.0 is closed. |
| Git delivery status | Unit 0.0 is approved for commit and delivery; consult Git history and the active Pull Request for the current delivery state. |
| Reference | `NISFI_MASTER_SPEC.md`, Sections 4, 5, 16, 17, and 19 |

## Unit 0.0 objective

Document the empty/current repository truth, confirm the master-spec architecture and Node.js/pnpm policy, and establish safe baseline documentation without creating application code, dependencies, service configuration, or a monorepo scaffold.

## Implemented scope

- Recorded that the repository starts with the master specification and `.gitkeep`, with no existing application, package manifest, dependencies, Firebase configuration, or test suite.
- Documented the required Node.js 22 LTS and pnpm 11 policy in documentation only.
- Recorded the mandated architecture boundary, product baseline, secret-handling rules, and work-unit approval cadence.
- Created the durable decision register with separate mandated and deferred owner decisions.
- Created an environment-variable name template containing no values, identifiers, credentials, keys, URLs, or Firebase configuration.

## Files created by Unit 0.0

| File | Purpose |
|---|---|
| `README.md` | Repository orientation, source of truth, approved baseline, secret policy, and current scope. |
| `docs/DECISIONS.md` | Mandated decisions, deferred owner decisions, and Unit 0.0 scoped decisions. |
| `docs/PHASE_STATUS.md` | This official phase/resume record. |
| `.env.example` | Expected environment variable names only, with no assigned values. |

## Explicitly not implemented

- No `package.json`, pnpm workspace, lockfile, `.nvmrc`, or exact package pinning.
- No `apps/web`, `functions`, or `packages/shared` directories.
- No dependency installation, Next.js scaffold, Tailwind, shadcn/ui, next-intl, Firebase SDK, emulator configuration, CI, or tests.
- No Firebase project IDs, web config, VAPID key, service account, credentials, deployment, or external service integration.
- No product UI, design direction, routes, application code, data model implementation, security rules, or Cloud Functions.
- No commit, push, merge, Pull Request, or deployment.

## Verification evidence

The following checks are required for this documentation-only unit and must be rerun after any revision before requesting approval:

| Check | Expected evidence |
|---|---|
| Repository inventory | Only the approved Unit 0.0 files are added; no scaffold/application directories or package files exist. |
| Secret/config review | `.env.example` contains names only; no assigned values, project IDs, credentials, or keys appear in the added files. |
| Master-spec consistency | Node.js 22, pnpm 11, architecture boundary, and one-unit cadence match `NISFI_MASTER_SPEC.md`. |
| Git review | `git diff --check` succeeds and the reviewed diff is limited to the four approved files. |

## Next proposed unit — do not execute without approval

**Phase 0 / Unit 0.1: pnpm monorepo scaffold.**

Proposed outcome: create `apps/web`, `functions`, and `packages/shared`; establish strict TypeScript plus lint/format/test scripts; pin the approved exact pnpm version in `packageManager`; and make `pnpm check` pass on the scaffold.

This is the next proposed unit only. It is not authorized to start until the owner gives explicit approval. No files for it were created by Unit 0.0.
