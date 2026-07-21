# Nisfi — Phase Status and Resume Record

## Official resume rule

This file is the official record for resuming work, alongside `NISFI_MASTER_SPEC.md`, `docs/DECISIONS.md`, the actual repository state, and the owner's newest instruction. A unit may move forward only after explicit owner approval; silence is not approval.

## Current position

| Field | Value |
|---|---|
| Current phase | Phase 1 — Public experience and authentication |
| Current unit | Unit 1.2 — about / contact / legal-page shells (privacy, terms) with draft labelling (delivered to `main`) |
| Implementation state | Delivered to `main`. Phase 0 foundation complete except deferred real Firebase/production wiring (O-001); building Phase 1 public surface against emulators/mocks. |
| Delivery note | Owner directed that all work land on `main`; each completed unit is fast-forwarded to `main`. |
| Design decision | Direction A «وَقار» selected by the owner on 2026-07-21 (D-001 resolved); recorded in `docs/DESIGN_SYSTEM.md`. |
| Previous units | Unit 0.0 (docs, approved 2026-07-20), Unit 0.1 (scaffold), Unit 0.2 (locale routing/RTL), Unit 0.3 (two directions) — all delivered to `main`. |
| Reference | `NISFI_MASTER_SPEC.md`, Sections 4, 5, 9, 13, 14, 15, and 16 |

## Unit 0.5 — completed (foundation; real wiring deferred per O-001)

Establishes the backend boundary and Firebase foundation. Real cloud wiring/deployment is deferred to the final production step (O-001); everything below is implemented and verified without secrets.

- **Boundary lint rule:** ESLint `no-restricted-imports` forbids `firebase`/`firebase-admin` outside `apps/web/src/infrastructure/firebase/**` (Section 5.1).
- **Emulator config:** `firebase.json` (auth/firestore/storage emulators), `.firebaserc` (project `nisfi-d9db1`), `firestore.indexes.json` (all nine composite indexes from Section 10.13).
- **Security rules (baseline, default-deny):** `firestore.rules` and `storage.rules` encode the shared predicates (signedIn/isSelf/role/isStaff/isAdmin/isSuper/isActive) and core invariants — owner-only user docs with allow-listed updates, staff reads, functions-only audit logs, and originals/verification media never client-readable. Per-collection rules and the full Section 11.4 matrix expand in their feature units (e.g. profiles in 2.1).
- **Emulator rules tests:** `firebase/tests/firestore.rules.test.ts` — **7 tests pass** under the Firestore emulator (unauth deny, owner read, other-member deny, moderator claim, field-lock deny, default-deny write, audit-log deny). Run via `pnpm test:rules`.
- **Env-based init:** `infrastructure/firebase/{env,client}.ts` (web app + App Check, reads `NEXT_PUBLIC_*`) and `functions/src/firebase.ts` (Admin SDK, reads `FIREBASE_*` or ADC). No secrets hardcoded or committed.
- **CI:** `.github/workflows/ci.yml` runs the quality gate + web build, plus a Java-backed job running the emulator rules tests.
- **Verified:** `pnpm check` and `next build` green; `pnpm test:rules` green; emulators start.

**Remaining for G0 (needs owner input, D-002):** provide the web config (`NEXT_PUBLIC_FIREBASE_*`, VAPID, reCAPTCHA App Check site key) and rotated server credentials as environment secrets; then connect the running app to the real project and confirm end-to-end. Feature adapters (profile/request/match/… repositories) and Cloud Functions handlers are built in their Phase 1+ units.

## Unit 0.4 — completed

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

## Owner directives — 2026-07-21 (affect the whole plan)

- **O-001 — secrets/wiring deferred to a final step.** Real Firebase config/credentials, image-platform keys, and production deployment are done **once, at the end**. Until then, feature units are built and verified against emulators/mocks. Gate G0's real-project connection is therefore deferred; the 0.5 foundation (boundary, emulators, rules, env-based init, CI) stands.
- **O-002 — images on a free platform (Cloudinary), not Firebase Storage.** Overrides Section 4/10.14/11.3 for image storage. Privacy preserved via Cloudinary private/authenticated delivery + on-the-fly blur + short-lived signed reveal URLs. The `StorageService` port stays backend-agnostic; the adapter (built in Unit 2.4) targets Cloudinary. Firebase remains for Auth/Firestore/Functions/FCM/App Check.

## Unit 1.2 — completed (delivered to `main`)

About / contact / legal-page shells on the public shell, localized, with clear draft/legal-review labelling and no invented legal assurances.

- **Routes:** `/[locale]/about`, `/contact`, `/privacy`, `/terms` — all statically generated per locale.
- **Legal pages:** a prominent `LegalDraftBanner` ("Draft · Under legal review") plus generic, obligation-free sections. Contact makes no support promises it can't keep (D-009 pending).
- **Shared shell:** `PublicPage` + `PublicSection`; footer now links Company (about/contact) and Legal (privacy/terms).
- **SEO:** per-page localized `generateMetadata` with canonical + hreflang alternates (`lib/seo.ts`).
- **i18n:** `About` / `Contact` / `Legal` namespaces across ar/en/tr; no hardcoded strings.
- **Verified:** desktop RTL (Arabic) via Chromium; all routes 200; `pnpm check` + `next build` green (53 routes).

## Unit 1.1 — completed (delivered to `main`)

Premium localized landing page and shared public navigation/footer on the Waqār system.

- **Public shell:** `PublicHeader` (brand, section nav, locale switcher, log-in/get-started) and `PublicFooter` (product/legal columns, locale, draft-legal note, rights).
- **Landing sections:** hero (headline + geometric brand art + trust row), how-it-works (3 steps), principles (3), FAQ (3), and a final CTA.
- **SEO:** localized `generateMetadata` with title/description, canonical, `hreflang` alternates (ar/en/tr), and Open Graph.
- **i18n:** `Public` + `Home` namespaces added to all three locales; no hardcoded UI strings.
- **Verified:** desktop RTL (Arabic) and LTR (English, mirrored) via Chromium; `pnpm check` and `next build` green. Legal links render as draft text (real pages arrive in Unit 1.2). Auth CTAs point to `/app` until auth lands (1.3/1.4).

## Next proposed unit

**Phase 1 / Unit 1.3: register / login / forgot-password UI and validation** (three-locale field/error/loading flows) — then 1.4 (Firebase Auth integration via the Auth emulator, per O-001).

### Deferred to the final "production wiring" step (O-001)

- Provide, as environment secrets: Firebase web config (`NEXT_PUBLIC_FIREBASE_*`, VAPID, reCAPTCHA App Check site key), rotated server credentials (`FIREBASE_*`), and Cloudinary keys.
- Connect to the real Firebase project + Cloudinary, region/data-residency (D-004), billing guardrails (D-003), then deploy. This closes gate G0 and enables production.
