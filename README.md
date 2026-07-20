# Nisfi — نِصفي

Nisfi is a privacy-first, verification-first web platform for serious, marriage-intent matchmaking for Arabic-speaking Muslims worldwide. The product will support Arabic (the default, RTL), English, and Turkish.

> **Project status:** Phase 0 / Unit 0.0 was completed and owner-approved on 2026-07-20. This repository intentionally contains no application scaffold, dependencies, Firebase configuration, or deployable service yet.

## Source of truth

[`NISFI_MASTER_SPEC.md`](./NISFI_MASTER_SPEC.md) is the binding product and execution specification. If any future implementation, document, or discussion conflicts with it, the owner must resolve the conflict before implementation proceeds.

## Current repository scope

This unit documents the product foundation only. It does **not** create the planned pnpm monorepo, `apps/web`, `functions`, or `packages/shared`; it does not install dependencies; and it does not connect to Firebase or any external service.

The next proposed work unit is Phase 0 / Unit 0.1 (pnpm monorepo scaffold), but it must not begin until the owner explicitly authorizes Unit 0.1.

## Approved technical baseline

The following baseline is specified by the master document and is recorded here for orientation only:

- Runtime policy: **Node.js 22 LTS** and **pnpm 11**.
- Web application: Next.js 16.x, App Router, and strict TypeScript.
- UI: Tailwind CSS and adapted shadcn/ui components.
- Localization: `next-intl` with `/ar`, `/en`, and `/tr` routes; Arabic is RTL by design.
- Backend services: Firebase Authentication, Cloud Firestore, Firebase Storage, Cloud Functions for Firebase (2nd gen, Node 22), Firebase Cloud Messaging, and Firebase App Check.
- Repository layout planned for Unit 0.1: `apps/web`, `functions`, and `packages/shared`.

No package manifest exists yet by design. The exact package versions and the `packageManager` field will be pinned only in Unit 0.1 after approval.

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
