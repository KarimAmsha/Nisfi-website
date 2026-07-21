# Nisfi — Phase Status and Resume Record

## Official resume rule

This file is the official record for resuming work, alongside `NISFI_MASTER_SPEC.md`, `docs/DECISIONS.md`, the actual repository state, and the owner's newest instruction. A unit may move forward only after explicit owner approval; silence is not approval.

## Current position

| Field | Value |
|---|---|
| Current phase | Phase 3 — Discovery and intentional connection requests |
| Current unit | Unit 3.3 — profile detail and privacy-preserving media presentation (delivered to `main`) |
| Implementation state | Delivered to `main`. Building Phase 3 on emulators/mocks; next is Unit 3.4 (connection-request composer + server enforcement). Real Cloudinary + Firebase wiring deferred to the final production step (O-001/O-002). |
| Delivery note | Owner directed that all work land on `main`; each completed unit is fast-forwarded to `main`. |
| Design decision | Direction A «وَقار» selected by the owner on 2026-07-21 (D-001 resolved); recorded in `docs/DESIGN_SYSTEM.md`. |
| Previous units | Unit 0.0 (docs, approved 2026-07-20), Unit 0.1 (scaffold), Unit 0.2 (locale routing/RTL), Unit 0.3 (two directions) — all delivered to `main`. |
| Reference | `NISFI_MASTER_SPEC.md`, Sections 4, 5, 9, 13, 14, 15, and 16 |

## Unit 3.3 — completed (delivered to `main`)

Member-facing profile detail reachable from a discovery card, showing only public data and protected media (originals never reachable).

- **Route:** `/[locale]/app/discover/[uid]` (noindex) → `ProfileDetail`. The discovery card now offers a **View profile** link alongside the (disabled) request affordance.
- **Detail (`components/discovery/profile-detail.tsx`):** protected photo grid (lock placeholders — never a real image) with a privacy note, verified identity header (name · age · city · country), about, a details grid (marital/children/practice/timeline/languages/education/occupation), and localized compatibility answers rendered from `STARTER_QUESTIONS` + the profile's `answers`. A sticky connection-request CTA is a disabled affordance until the composer (Unit 3.4).
- **Data (`use-candidate-profile.ts`):** configured mode reads via `ProfileRepository.getPublic`, so the tightened `profiles/{uid}` rule (visible + verified for eligible members) turns an ineligible read into an `unavailable` state; preview serves the discovery seed (enriched with narrative + a photo count). Photo metadata/counts arrive with Cloudinary (O-001).
- **Verified:** `pnpm check` + `next build` (72 routes) green; RTL detail screenshot — protected media, public-only data, honest unavailable/loading states.

## Unit 3.2 — completed (delivered to `main`)

The real discovery surface on the `DiscoveryRepository` port from 3.1 — privacy-first cards, a responsive filter sheet, active-filter chips, saved filter state, and full result states.

- **Browser (`components/discovery/discovery-browser.tsx`):** header, a **Filters** button with an active-facet count, an active-chips row (each removable) + clear-all, the results grid, and honest states — loading skeleton grid, error (retry), empty (clear-filters), and a **Load more** cursor button. No fabricated total count.
- **Card (`discovery-card.tsx`):** protected-photo treatment (a real placeholder, never a CSS-blurred photo), verified badge, and meaningful compatibility signals (city·country, practice, timeline). The connection-request CTA is a disabled affordance — the composer lands in Unit 3.4.
- **Filter sheet (`filter-sheet.tsx`):** responsive bottom-sheet (mobile) / side panel (desktop) driven by `discoveryFiltersSchema` — sort, age range, country, city, and toggle-chip facets (languages, marital, children, practice, timeline), reusing the onboarding option labels.
- **Data (`use-discovery.ts` + `discovery-preview.ts`):** accumulates pages and threads the stable cursor via `DiscoveryRepository.fetchPage`; in preview it runs an 8-member seed through the same `selectDiscoveryPage` logic, so filters and pagination are genuinely exercised. A visible preview badge marks demo data.
- **Saved filters:** persisted to `localStorage` and restored on load (real per-user persistence to `users.settings.discoveryFilters` deferred, O-001).
- **Verified:** `pnpm check` + `next build` (71 routes) green; RTL desktop grid + mobile single-column screenshots (no page horizontal scroll).

## Unit 3.1 — completed (delivered to `main`)

Discovery query model, eligibility/exclusion strategy, and repository, with pagination and exclusion demonstrated on seeded users.

- **Shared (`packages/shared/src/discovery.ts`):** `DiscoveryCandidate`/`DiscoveryViewer` projections, `isEligibleCandidate` (opposite gender, visible, verified, active, not self, not blocked either direction, not matched), the persisted `discoveryFiltersSchema` (age range, countries, city substring, languages, marital/children/religiousness/timeline, sort), `matchesFilters`, `computeAge`, and the deterministic `selectDiscoveryPage` (Section 10.15 post-filter half): stable `{sortKey, uid}` cursor, `scanCap` read bound, and an honest `exhausted` signal — never a fabricated total count.
- **Port + adapter:** `core/ports/discovery.ts` (`DiscoveryRepository.fetchPage`) and `infrastructure/firebase/discovery.repository.ts` implementing the deterministic query plan — mandatory eligibility + sort pushed into the indexed Firestore query (the existing `profiles` composite indexes), bounded batch scan, then `selectDiscoveryPage` for facets + per-viewer exclusions. Returns an empty page in preview; real query wiring deferred (O-001).
- **Rules:** `profiles/{uid}` non-owner reads tightened to **visible AND verified** (owner/staff unchanged). Fixed a pre-existing `role()` claim-read that threw for claimless members (`keys().hasAny(['role'])`), and made the rules vitest run files sequentially so they stop clearing each other's seed data.
- **Tests:** 16 new shared unit tests (eligibility, facets, cursor pagination, sort orders, scan cap, exhaustion) — shared suite now **34**. Emulator rules suite now **27** (added hidden/unverified read denials + owner/staff still-read), green and stable.
- **Verified:** `pnpm check` + `next build` (71 routes) + `pnpm test:rules` all green.

## Unit 2.6 — completed (delivered to `main`; closes Phase 2 / gate G2, pending deferred wiring)

Own-profile review/edit surface and the profile-completion gate — the member sees their profile state at a glance and is guided to finish it before it can surface to others.

- **Hook:** `lib/use-own-profile.ts` loads the signed-in member's own profile via `ProfileRepository.getOwn` when Firebase is configured; stays `null` in preview (prompts completion rather than blocking).
- **Overview:** `components/profile/profile-overview.tsx` at `/[locale]/app/me` — profile summary (display name, city · country) with an edit/complete CTA back into the reusable onboarding builder, a live completion meter driven by `computeProfileCompletion`, and the `PhotoManager` below.
- **Completion gate (soft):** `components/profile/completion-banner.tsx` renders a gentle app-wide nudge (with the live percentage and a link to finish) mounted in `MemberShell` below the header; it self-hides while loading, when there is no profile yet, and once completion reaches 100%. Real (hard) gating on `/app` stays server-side via rules once the backend is wired (A-008/O-001).
- **i18n:** `Me` namespace (title, completion label, edit/complete CTAs, not-set, banner) across ar/en/tr; added a `SparkIcon` to the outline icon family.
- **Verified:** `pnpm check` (typecheck + lint + format + 20 unit tests) and `next build` (71 routes) green; RTL screenshot of `/ar/app/me`.

## Unit 2.5 — completed (delivered to `main`)

Identity-verification submission and the user status experience (retry/rejection UX).

- **Shared:** `VerificationRequest` types + statuses (`pending`/`approved`/`rejected`), `canSubmitVerification()`.
- **Port + adapter:** `core/ports/verification.ts` (`VerificationRepository`) and `infrastructure/firebase/verification.repository.ts` (submit a strictly-shaped `pending` request; read own latest via an equality-only query — no composite index).
- **UI:** `/[locale]/app/verification` `VerificationFlow` — submission form (ID + selfie pickers) with a strong privacy note (selfie/ID private, never shown to members), and status states: pending (in review), approved (verified), rejected (reason + resubmit). Honest local preview when unconfigured.
- **Rules + tests:** `firebase/tests/verification.rules.test.ts` covers active-owner create-pending, non-pending create denied, cross-user create denied, owner read, other-member read denied, staff read, and client-update denied. `pnpm test:rules` now runs **24 tests** across rules + auth + profile + verification.
- **Verified:** `pnpm check` + `next build` (71 routes) green.

## Unit 2.4 — completed (delivered to `main`; real Cloudinary deferred per O-001)

Photo upload/reorder/delete and moderation states behind a backend-agnostic `StorageService` port, targeting the free image platform (Cloudinary, O-002).

- **Shared:** `Photo` types + moderation states (`pending`/`approved`/`rejected`), limits (`MAX_PHOTOS`, `MAX_PHOTO_BYTES`, accepted types), and `validatePhotoFile()` (unit-tested — shared tests now 18).
- **Port + adapters:** `core/ports/storage.ts` (`StorageService`); a preview **mock** adapter (in-memory, owner object-URL previews, new photos start `pending`) and a documented **Cloudinary** adapter skeleton (private originals, on-the-fly `e_blur` public view, short-lived signed reveal URLs, signed uploads). `getStorageService()` picks Cloudinary when configured, else the mock.
- **UI:** `PhotoManager` at `/[locale]/app/me` — add (client type/size/limit validation), reorder (earlier/later), delete, per-photo moderation badge, count, and a prominent privacy note. RTL-verified in the member shell.
- **Deferred:** real Cloudinary credentials + the signed-upload Cloud Function are wired in the final production step (O-001). `.env.example` documents `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` + server keys.
- **Verified:** `pnpm check` + `next build` (71 routes) green; RTL screenshot.

## Unit 2.3 — completed (delivered to `main`)

Onboarding steps 4–6, dynamic compatibility questions, and profile-completion logic.

- **Wizard (now 6 steps):** adds Background (education/occupation), Plans (marriage timeline + about textarea), and Compatibility (dynamic questions + visibility). Per-step validation, resumable draft, RTL.
- **Compatibility questions** (`packages/shared/src/compatibility.ts`): localized `CompatibilityQuestion` schema + a starter set rendered dynamically (final wording is owner decision D-008; admin CRUD via `questionBank` comes in a later unit). Answers stored on the profile as `answers` (added to the schema and the rules field-lock).
- **Completion logic:** `computeProfileCompletion()` (pure, 0–100%) over tracked fields + answered questions, unit-tested — shared tests now **14**.
- **Verified:** `pnpm check` + `next build` (68 routes) green; `pnpm test:rules` 17 tests green (profile field-lock still holds with the new `answers` key).

## Unit 2.2 — completed (delivered to `main`)

Onboarding profile-builder wizard, steps 1–3, resumable and localized.

- **Route:** `/[locale]/onboarding` (noindex, `RequireAuth`). Steps: Basics (name/gender/DOB), Location & languages (country/city/language chips), Situation (marital/children/religiousness).
- **Wizard:** react-hook-form + zod per-step validation; progress stepper; back/next; a `SelectField` primitive and language toggle chips; RTL-aware.
- **Resumable:** progress persisted to `localStorage` on every change and restored on return; on finish, writes the collected fields via `ProfileRepository.saveOwn` (now accepts a partial) when Firebase is configured, otherwise keeps the local draft and shows an honest pending note.
- **i18n:** `Onboarding` namespace (fields, enum option labels, errors) across ar/en/tr.
- **Fix:** the ESLint ignore `**/lib/**` was unintentionally excluding `apps/web/src/lib/**` from linting; scoped it to `functions/lib/**`, and anchored the Firebase-boundary rule regex so it matches the SDK, not our `@/infrastructure/firebase/*` modules.
- **Verified:** RTL wizard via Chromium; `pnpm check` + `next build` green (68 routes).

## Unit 2.1 — completed (delivered to `main`)

Profile domain schemas, the profile repository, and the private/public profile-split security rules with emulator tests.

- **Shared schemas** (`packages/shared/src/profile.ts`): Zod `editableProfileSchema` (owner-editable public fields), `privateProfileSchema` (sensitive), `PublicProfile` type, and `EDITABLE_PROFILE_KEYS` (the client-writable key list, kept in sync with the rules). Unit tests in `pnpm check`.
- **Port + adapter:** `core/ports/profile.ts` (`ProfileRepository`) and `infrastructure/firebase/profile.repository.ts` (own/public/private get + save; Firestore `Timestamp` → ISO at the boundary; `createdAt`/`updatedAt` server-set).
- **Rules:** `profiles/{uid}` writes field-locked to the editable keys (system/moderation/photo fields and client timestamps rejected; `createdAt`/`updatedAt` must equal server time); `profiles/{uid}/private/**` is owner-write, owner+staff-read.
- **Tests:** `firebase/tests/profile.rules.test.ts` covers owner / other active member / staff / unauthenticated and the field-lock. `pnpm test:rules` now runs **17 tests** (rules + auth + profile). `pnpm check` + `next build` green.

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

## Unit 1.4 — completed (delivered to `main`)

Firebase Authentication integrated through the backend-agnostic boundary, exercised on the Auth emulator (no real keys, O-001).

- **Port + adapter:** `core/ports/auth.ts` (`AuthService`, `AuthError`) and `infrastructure/firebase/auth.service.ts` (email/password sign-up/in/out, password reset, email verification, `onAuthChange` with role from custom claims). Firebase errors map to stable domain codes.
- **Emulator wiring:** `env.ts` emulator mode (demo config + `NEXT_PUBLIC_FIREBASE_USE_EMULATOR`), `client.ts` connects the Auth emulator; public pages still render when Firebase is unconfigured.
- **Client auth state:** `lib/auth-context.tsx` (`AuthProvider` in the root locale layout, `useAuth`).
- **Flows:** login/register/forgot forms call the service (honest pending state when unconfigured); email-verification screen (`/auth/verify-email`) with resend + re-check; first-login routing to `/app` (or verify-email).
- **Guards:** `RequireAuth` on `/app`, `RequireAdmin` on `/admin` — UX only (real authorization stays server-side via rules; A-008). Permissive when unconfigured so shells stay viewable in preview.
- **Tests:** `firebase/tests/auth.test.ts` — auth path against the emulator; `pnpm test:rules` now runs firestore + auth → **9 tests pass**. `pnpm check` + `next build` green (65 routes).

## Unit 1.3 — completed (delivered to `main`)

Register / login / forgot-password UI and validation (react-hook-form + zod), UI only — the auth backend is Unit 1.4.

- **Routes:** `/[locale]/auth/login`, `/auth/register`, `/auth/forgot` (noindex), on a quiet, focused `AuthCard` in a centered `auth/layout` with locale switcher and a legal note.
- **Forms:** react-hook-form + zod with locale-built error messages; field/error/loading states, correct `type`/`autocomplete`/`inputmode`, password rules and confirm-match; honest pending/sent states (no fake auth).
- **i18n:** `Auth` namespace across ar/en/tr; no hardcoded strings.
- **Verified:** RTL (Arabic login) via Chromium; all routes 200; `pnpm check` + `next build` green (62 routes).

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

**Phase 3 / Unit 3.4: connection-request composer, limits, dedupe, cooldown, server enforcement** — a written connection-request composer wired from the discovery card and profile detail, with client + server-enforced limits (max pending sent, daily sends), duplicate/pair dedupe (`pairKey`), and cooldown. Backed by a `ConnectionRequestRepository` port, `connectionRequests/{id}` rules, and race/duplicate/limit tests.

### Deferred to the final "production wiring" step (O-001)

- Provide, as environment secrets: Firebase web config (`NEXT_PUBLIC_FIREBASE_*`, VAPID, reCAPTCHA App Check site key), rotated server credentials (`FIREBASE_*`), and Cloudinary keys.
- Connect to the real Firebase project + Cloudinary, region/data-residency (D-004), billing guardrails (D-003), then deploy. This closes gate G0 and enables production.
