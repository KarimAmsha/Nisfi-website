# Nisfi — Phase Status and Resume Record

## Official resume rule

This file is the official record for resuming work, alongside `NISFI_MASTER_SPEC.md`, `docs/DECISIONS.md`, the actual repository state, and the owner's newest instruction. A unit may move forward only after explicit owner approval; silence is not approval.

## Current position

| Field | Value |
|---|---|
| Current phase | Phase 0 — Product foundation and approved design language |
| Current unit | Unit 0.4 — approved design tokens, primitives, member/admin shells, responsive nav, `docs/DESIGN_SYSTEM.md` |
| Implementation state | Implemented and verified; delivered to `main` and `claude/project-review-a9s1w1` |
| Delivery note | Owner directed that all work land on `main`; each completed unit is fast-forwarded to `main`. |
| Design decision | Direction A «وَقار» selected by the owner on 2026-07-21 (D-001 resolved); recorded in `docs/DESIGN_SYSTEM.md`. |
| Previous units | Unit 0.0 (docs, approved 2026-07-20), Unit 0.1 (scaffold), Unit 0.2 (locale routing/RTL), Unit 0.3 (two directions) — all delivered to `main`. |
| Reference | `NISFI_MASTER_SPEC.md`, Sections 4, 5, 9, 13, 14, 15, and 16 |

## Unit 0.4 — current

The owner-approved «وَقار» direction is turned into a real design system on the Next.js app: Tailwind v4 tokens, primitives, member and admin shells, responsive navigation, and state patterns, recorded in `docs/DESIGN_SYSTEM.md`.

- **Tokens:** Tailwind v4 `@theme` in `globals.css` (Waqār palette, radii, shadow; fonts switch by `dir`).
- **Primitives** (`components/ui`): Button (variants/sizes/loading), Card, Badge/status pill, Field (labelled input), Skeleton, EmptyState, and a coherent outline icon set.
- **Shells** (`components/shell`): MemberShell (top bar + desktop sidebar + mobile bottom nav) and AdminShell (queue-first emerald sidebar with counts).
- **Surfaces:** localized member routes (`/app/discover` populated; requests/matches/notifications empty states; verification status; settings) and admin routes (`/admin/dashboard` stat tiles; `/admin/verifications` queue + detail drawer; users/reports empty states). Landing refreshed onto the token system with entry links.
- **i18n:** all new copy added to `messages/{ar,en,tr}.json`; no hardcoded UI strings; typed message keys.
- **Design QA (Section 14.9):** verified via Chromium at desktop RTL (member + admin), LTR (mirrored sidebar), and mobile (bottom nav + single-column stacking). No page horizontal scroll; wide admin table scrolls in its own container.

## Unit 0.3 — completed (Direction A selected)

Two polished, distinct visual directions are presented on real Nisfi content — the landing page, a member surface (discovery with photo-privacy treatment), and an admin surface (verification queue) — in Arabic RTL with an English LTR sample. Per master spec Section 14.2, the owner selects or combines one; the approved direction is then recorded in `docs/DESIGN_SYSTEM.md` (Unit 0.4) and becomes binding. No product UI is built on either direction yet.

- **Deliverables:** `docs/design/visual-directions.html` (interactive A/B preview) and `docs/design/DIRECTIONS.md` (rationale, palettes, typography, components, photo-privacy treatment, how to choose).
- **Direction A — «وَقار»:** deep emerald + restrained antique gold; institutional, crisp, editorial.
- **Direction B — «سَكينة»:** teal-slate + warm clay; serene, airy, contemporary.
- **Design QA (Section 14.9):** verified via Chromium screenshots at desktop and narrow widths — RTL hierarchy, responsive collapse (no page horizontal scroll; admin table scrolls in its own container), status/pill states, protected-photo treatment, and AR + LTR copy all render correctly.
- **Constraints honoured:** premium, privacy-led, Arabic-first; none of the prohibited dating-app shortcuts (no pink/hearts/swipe/neon/stock couples/fake metrics); protected photo is an intentional treatment, not a CSS blur of a real photo.

**Resolved:** the owner selected **Direction A «وَقار»** on 2026-07-21. It is now the binding system in `docs/DESIGN_SYSTEM.md`.

## Unit 0.2 objective

Add next-intl locale routing over the scaffold: the URL prefix is always present (`/ar`, `/en`, `/tr`) with Arabic as the default, `dir="rtl"` for Arabic and `dir="ltr"` otherwise, self-hosted fonts, and a minimal, fully localized route shell with working locale switching. No product features, auth, Firebase, Tailwind, or design system are introduced.

## Implemented scope

- Installed Next.js 16.2.10 (App Router, Turbopack), React 19.2.7, and next-intl 4.13.2 into `apps/web`, pinned exactly.
- Added next-intl routing (`src/i18n/routing.ts`) reusing the shared `Locale` model (`ar` default, `localePrefix: "always"`), request config (`src/i18n/request.ts`), and locale-aware navigation (`src/i18n/navigation.ts`).
- Added `src/proxy.ts` (Next.js 16's renamed middleware) running the next-intl middleware for locale normalization.
- Added the `[locale]` route group: root layout sets `<html lang dir>` semantically, self-hosts IBM Plex Sans Arabic (Arabic) and Inter (Latin) via `next/font`, and wraps content in `NextIntlClientProvider`.
- Added a minimal, fully localized landing shell and a `LocaleSwitcher` client component; all copy lives in `messages/{ar,en,tr}.json` with no hardcoded UI strings.
- Added typed message augmentation (`src/global.d.ts`) so translation keys are checked.
- Extended tooling: Next-compatible strict `tsconfig`, `@next/eslint-plugin-next` rules for `apps/web`, and `.next`/`next-env.d.ts` ignored by ESLint/Prettier/git.

## Files created or changed by Unit 0.2

| File / directory | Purpose |
|---|---|
| `apps/web/next.config.ts` | Next config wrapped with the next-intl plugin. |
| `apps/web/tsconfig.json` | Next-compatible strict TypeScript config. |
| `apps/web/src/i18n/{routing,request,navigation}.ts` | next-intl routing, request config, navigation primitives. |
| `apps/web/src/proxy.ts` | Locale middleware (Next 16 `proxy`). |
| `apps/web/src/app/[locale]/{layout,page}.tsx` | Localized root layout (RTL/LTR, fonts) and landing shell. |
| `apps/web/src/app/globals.css` | Minimal RTL-aware base styles using logical properties. |
| `apps/web/src/components/locale-switcher.tsx` | Locale switcher. |
| `apps/web/src/global.d.ts` | Typed locale/messages augmentation. |
| `apps/web/messages/{ar,en,tr}.json` | Localized copy (single source for UI strings). |
| `eslint.config.mjs`, `.gitignore`, `.prettierignore` | Next plugin + ignore Next build artifacts. |

## Explicitly not implemented

- No Tailwind, shadcn/ui, design tokens, or design system (Units 0.3–0.4).
- No authentication, session guards, Firebase SDK, or App Check (Units 0.5 and 1.x).
- No `no-restricted-imports` Firebase boundary lint rule (Unit 0.5).
- No product routes beyond the landing shell, no data model, no Cloud Functions handlers.
- No secrets, project IDs, or deployment configuration.

## Verification evidence

| Check | Evidence |
|---|---|
| Runtime policy | Node `v22.22.2`, pnpm `11.15.1` |
| Production build | `next build` succeeds; `/ar`, `/en`, `/tr` prerendered (SSG); proxy detected |
| Root redirect | `GET /` → `307` to `/ar` (default locale) |
| RTL/LTR | `/ar` → `<html lang="ar" dir="rtl">`; `/en` and `/tr` → `dir="ltr"` |
| Localization | Arabic/English/Turkish copy rendered from message catalogs; no hardcoded UI strings |
| Locale switching | Switcher links to `/ar`, `/en`, `/tr`; active locale marked `aria-current` |
| Aggregate gate | `pnpm check` passes: typecheck, lint, format, and 5 tests across 3 packages |

## Next proposed unit — do not execute without approval

**Phase 0 / Unit 0.5: Firebase adapters/ports boundary, emulator config, App Check/env wiring, CI, and the restricted-import lint rule.**

Unit 0.5 depends on owner-provided inputs (decision D-002): Firebase development/staging/production project IDs, web configuration, VAPID key, and server credentials through a secure channel. **This closes Phase 0 (gate G0).**

**Groundwork already in place (no secrets):**

- The `no-restricted-imports` ESLint rule now forbids `firebase`/`firebase-admin` imports outside `apps/web/src/infrastructure/firebase/**` (Section 5.1 boundary).
- A GitHub Actions CI workflow (`.github/workflows/ci.yml`) runs `pnpm install --frozen-lockfile`, `pnpm check`, and the web build on Node 22 / pnpm 11.

**Still needed from the owner (D-002), supplied securely — never pasted in chat:** the client web config (`NEXT_PUBLIC_FIREBASE_*`, VAPID key) and server credentials (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) as environment variables/secrets. Remaining 0.5 work (Firebase adapters implementing the ports, App Check/env wiring, and Firestore/Storage emulator config with rules tests) is done once those are provided.
