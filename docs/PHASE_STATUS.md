# Nisfi — Phase Status and Resume Record

## Official resume rule

This file is the official record for resuming work, alongside `NISFI_MASTER_SPEC.md`, `docs/DECISIONS.md`, the actual repository state, and the owner's newest instruction. A unit may move forward only after explicit owner approval; silence is not approval.

## Current position

| Field | Value |
|---|---|
| Current phase | Phase 7 — Settings, privacy rights, hardening & launch |
| Current unit | Unit 7.5 — launch readiness (delivered to `main`) — closes Phase 7 feature work |
| Implementation state | Delivered to `main`. Phase 7 feature units complete; remaining before launch is the single final production-wiring step (O-001/O-002: real Firebase/Cloudinary keys, App Check enforcement, deploy Cloud Functions, rotate the leaked key). |
| Delivery note | Owner directed that all work land on `main`; each completed unit is fast-forwarded to `main`. |
| Design decision | Direction A «وَقار» selected by the owner on 2026-07-21 (D-001 resolved); recorded in `docs/DESIGN_SYSTEM.md`. |
| Previous units | Unit 0.0 (docs, approved 2026-07-20), Unit 0.1 (scaffold), Unit 0.2 (locale routing/RTL), Unit 0.3 (two directions) — all delivered to `main`. |
| Reference | `NISFI_MASTER_SPEC.md`, Sections 4, 5, 9, 13, 14, 15, and 16 |

## Unit 7.5 — completed (delivered to `main`) — closes Phase 7 feature work

Launch readiness: SEO/metadata sweep, sitemap + robots, and custom not-found / error pages (master spec Section 7 launch).

- **Metadata:** `[locale]/layout` now sets `metadataBase` (from `NEXT_PUBLIC_SITE_URL`, placeholder until O-001), a title template (`%s · نِصفي`), default Open Graph, and default `robots: index/follow`. Per-page localized titles/descriptions + canonical/hreflang from earlier units stand.
- **Sitemap:** `app/sitemap.ts` — the public marketing paths (`/`, `/about`, `/contact`, `/privacy`, `/terms`) with per-locale hreflang alternates; member/admin/auth areas excluded.
- **Robots:** `app/robots.ts` — allow public, **disallow** the private segments (`app`/`admin`/`auth`/`onboarding`/`status`) for every locale, with the sitemap + host. Verified live via `curl`.
- **Not-found:** a branded, localized RTL `[locale]/not-found.tsx` (fired by a `[locale]/[...rest]` catch-all so unmatched sub-paths get the localized page inside the locale layout), plus a minimal bilingual root `app/not-found.tsx` for paths outside any locale.
- **Error boundaries:** a localized client `[locale]/error.tsx` (generic message — no stack leaks — with retry) and a dependency-free bilingual root `app/global-error.tsx`.
- **i18n:** `NotFound` + `ErrorPage` namespaces across ar/en/tr.
- **No** shared/functions/rules changes — suites unchanged (shared 137, functions 54, rules 84).
- **Verified:** `pnpm check` + `next build` (103 routes incl. sitemap.xml/robots.txt) green; `curl` confirms robots + sitemap; RTL branded-404 screenshot; unknown paths return HTTP 404.

## Unit 7.4 — completed (delivered to `main`)

Security hardening: response headers + a strict CSP, App Check enforcement wiring, and a threat-model record (master spec «Security» / Phase 7).

- **Secure headers + CSP:** `next.config.ts` now sets, on every route, a self-first Content-Security-Policy (Firebase/Cloudinary/reCAPTCHA allowances only, `object-src 'none'`, `frame-ancestors 'none'`, dev-only `'unsafe-eval'`/websocket relaxations for HMR, `upgrade-insecure-requests` in prod) plus `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera=self, mic/geo off), `X-DNS-Prefetch-Control: off`, and HSTS. Verified live via `curl`.
- **App Check:** `ensureAppCheck()` (already scaffolded, guarded by a reCAPTCHA site key) is now invoked at client startup in `AuthProvider` — the enforcement point exists and stays inert until the site key is provided (O-001).
- **Upload validation (reviewed):** `validatePhotoUpload` already enforces type (jpeg/png/webp) / size (≤8 MB) / count (≤6) client-side, with the server re-validating bytes — captured in the checklist rather than re-implemented.
- **Threat model:** new `docs/SECURITY.md` — a STRIDE-lite model, the hardening checklist (rules-as-authorization, headers/CSP, App Check, upload validation, server-side rate limits, redacted logs, secret handling), and the production-wiring deferrals (App Check enforcement, key rotation, CSP nonce tightening, budgets/scanning).
- **No** shared/functions/rules changes — suites unchanged (shared 137, functions 54, rules 84).
- **Verified:** `pnpm check` + `next build` (101 routes) green; `curl` confirms all seven security headers on responses.

## Unit 7.3 — completed (delivered to `main`)

The status screen for non-active members and the app-wide lockout routing (master spec Sections 169, 322, 479).

- **Account status read:** `AccountRepository.getStatus` reads the owner's `users.status` (owner-readable), surfaced by the `useAccountStatus` hook (preview → `active` so shells stay viewable; a missing/unknown status fails open for UX — the rules remain the real gate).
- **Lockout routing:** `AuthGate` now waits for the status read and, when a signed-in verified member is `isLockedOut` (suspended / banned / deleted), replaces to `/status`. Enforcement is still server-side (`isActive()` rules); this is UX-only (A-008).
- **Status screen:** `/[locale]/status` (noindex, outside the auth-gated `/app`) — a centered card with a per-status title/body (suspended = temporary, banned = permanent, deleted = removed), a support pointer, sign-out, and the locale switcher. It redirects an unauthenticated visitor to login and an active member back to `/app`, so it can't trap anyone. Preview shows the suspended example.
- **i18n:** `Status` namespace (per-status title/body + support/sign-out) across ar/en/tr.
- **No** shared/functions/rules changes (the `deleted` status + `isLockedOut` + `isActive()` lockout already landed in 5.5 / 7.2) — suites unchanged (shared 137, functions 54, rules 84).
- **Verified:** `pnpm check` + `next build` (101 routes) green; RTL status-screen screenshot.

## Unit 7.2 — completed (delivered to `main`)

Member privacy rights: self-service data export and irreversible account deletion (master spec Section 7 / F11).

- **Shared:** `privacy.ts` — `MemberExport` + `assembleMemberExport` (a privacy-safe bundle of the member's OWN data only), `ANONYMIZED_DISPLAY_NAME` + `buildDeletionAnonymization` (displayName → "Deleted member", cleared about/answers/photos, visibility hidden), `canRequestDeletion` (any non-deleted account). Added `"deleted"` to `ACCOUNT_STATUSES` and made a deleted account terminal in `canSetAccountStatus`. New `privacy.test.ts` (shared suite now **137**).
- **Server core:** `functions/src/privacy.ts` — `buildMemberExport` and `evaluateAccountDeletion` (self-only, not-already-deleted → the anonymization + cascade plan: `users.status="deleted"`, close matches `closedReason:"deletion"`, remove tokens/notifications, disable auth). Functions suite now **54**.
- **Rules:** a `deleted`-status member is locked out of every product write (`isActive()` false) — new `privacy.rules.test.ts` proves report create + verification submit are denied. Rules suite now **84**.
- **Port + adapter:** `PrivacyRepository.exportMyData` (returns the bundle) and `deleteMyAccount`; the 7.1 placeholder export/delete methods were removed from `MemberSettingsRepository`.
- **UI:** `/app/settings` account section now does a real **data export** (downloads `nisfi-my-data.json`; in preview the bundle is assembled locally) and a **double-confirmation** account deletion (a danger panel with an "I understand this is permanent" acknowledgement gating the final delete, which then signs out and returns to the landing).
- **Deferred (O-001/O-002):** the `exportMyData` / `deleteMyAccount` callables (server gather + the anonymization/cascade transaction, Cloudinary asset deletion, audit) are wired at the final production step; the flow runs on the preview bundle until then.
- **Verified:** `pnpm check` (shared 137, functions 54) + `next build` (98 routes) + `pnpm test:rules` (84) green; RTL two-step-deletion screenshot.

## Unit 7.1 — completed (delivered to `main`)

The member settings surface: profile visibility, communication language, notification preferences, and account controls (master spec Section 7).

- **Shared:** `member-settings.ts` — `NOTIFICATION_CATEGORIES` (requests/matches/messages/announcements), `MemberPreferences`, `DEFAULT_MEMBER_PREFERENCES` (all on — a member opts out, never in), `memberPreferencesSchema`, `mergeMemberPreferences` (defaults over stored/absent, ignores junk), `notificationEnabled`. New `member-settings.test.ts` (shared suite now **134**).
- **Port + adapter:** `MemberSettingsRepository` — `getSettings`/`savePreferences`/`saveLocale` write the owner-allowed `users.locale` + `users.preferences` (rules already permit exactly those keys); `requestDataExport`/`requestAccountDeletion` are server-side callables (privacy-rights actions, never a client write).
- **Rules:** no new collection — added positive/negative tests proving an owner may update `locale` + `preferences` but cannot smuggle a `status` change alongside. Rules suite now **82**.
- **UI:** `/app/settings` fleshed out on the member shell — a profile-visibility toggle (writes `profiles.visibility` via `saveOwn`), a communication-language select (writes `users.locale`), notification-preference toggles per category, the existing blocked-list link, and an **Account** card with a working **sign-out** plus **privacy-rights** entry points (export my data / delete account) behind an explicit confirm, wired to CF callables (deferred).
- **Deferred (O-001):** `requestDataExport` / `requestAccountDeletion` callables (the real export/deletion flow is Unit 7.2); preferences/locale/visibility persist directly (owner writes) and work fully once configured.
- **Verified:** `pnpm check` (shared 134) + `next build` (98 routes) + `pnpm test:rules` (82) green; RTL settings screenshot.

## Unit 6.6 — completed (delivered to `main`) — closes Phase 6

Admin console responsiveness, keyboard access, and RTL/LTR QA (master spec Section 6.6 / Gate G6).

- **Responsive nav:** the admin shell now has a proper mobile treatment — a top bar with a hamburger that opens an accessible overlay **drawer** (was a crowded 12-item horizontal scroll). The desktop sidebar (`md+`) is unchanged. The nav list is shared between the two so labels, badges, and active state stay consistent.
- **Accessibility / keyboard:** a **skip-to-content** link (focus-revealed), the drawer toggle carries `aria-expanded` + `aria-controls`, opening the drawer moves focus to its close button, **Escape** closes it, a backdrop click closes it, and it auto-closes on navigation. Focus-visible rings on nav links, the toggle, and the close button; `<main>` is focusable (`tabIndex=-1`, `id="admin-main"`) as the skip target.
- **RTL/LTR:** the drawer anchors to the inline-start (right in RTL) with logical `start-*` / `inset-y-*` utilities, verified at 390px in Arabic — the panel slides from the right and the console list/detail grids collapse to a single column cleanly.
- **i18n:** `Admin.nav.menu` / `close` / `skip` across ar/en/tr.
- **No** shared/functions/rules changes (pure UI/QA polish) — all suites unchanged (shared 130, functions 51, rules 80).
- **Verified:** `pnpm check` + `next build` (98 routes) green; RTL screenshots at 390px (drawer open + closed, single-column console) and desktop (sidebar intact).

## Unit 6.5 — completed (delivered to `main`)

The three operations surfaces: the immutable audit-log explorer, privacy-safe exports, and the health view (master spec Sections 6.5, 10.11).

- **Shared:** `audit.ts` (`AUDIT_ACTIONS`, `canViewAudit` superAdmin, `matchesAuditFilter`, `redactAuditMetadata` — recursively redacts sensitive keys to `[redacted]`), `export.ts` (`EXPORTABLE_TABLES` with per-table sensitive columns, `EXPORT_ROW_LIMIT`, `canExport` admin+, `validateExportRequest` — allow-list + row/column limits, `csvField`/`toCsv` RFC-4180 CSV), `health.ts` (`SystemHealth`, `overallHealth` = worst check, `canViewHealth` moderator+). New tests (shared suite now **130**).
- **Server core:** `functions/src/ops.ts` — `evaluateExport` (CF18: role/table/row/column checked, returns safe columns + a redacted audit record) and `buildHealthSummary` (CF20: keeps only env/release/check status+note, derives overall — no secrets). Functions suite now **51**.
- **Rules:** `auditLogs/{id}` — superAdmin-only read, immutable (no client write/delete); `systemHealth/{doc}` — staff read, Functions-only write. New `ops.rules.test.ts`. Rules suite now **80**.
- **Port + adapter:** `OpsRepository.listAudit(filter)` (superAdmin, action-indexed + in-memory filter), `exportTable` (CF callable), `getHealth`.
- **UI:** `/admin/audit` (superAdmin — action/actor filter, event list, detail drawer with **redacted** metadata + "immutable, no edit/delete" note), `/admin/exports` (admin — table select showing included/excluded columns + row limit, CSV download, privacy note), `/admin/health` (moderator — env/release/overall status + per-check statuses/notes + "no secrets" note). New **Audit** (superAdmin), **Exports** (admin), **Health** (moderator) nav items. Preview seeds for all three.
- **Deferred (O-001):** the `exportAdminTable` (CF18) and `refreshSystemHealth` (CF20) callables and the audit-append on every staff mutation are wired at the final production step; the consoles run on preview seeds until then.
- **Verified:** `pnpm check` (shared 130, functions 51) + `next build` (98 routes) + `pnpm test:rules` (80) green; RTL audit (with redacted email), health, and export screenshots.

## Unit 6.4 — completed (delivered to `main`)

The plans & entitlements read model and the controlled, superAdmin-only manual management path — with subscriptions staying off in V1 (master spec Sections 6.4, 10.11–10.12).

- **Shared:** `plans.ts` — `Plan` / `Entitlement`, `FREE_PLAN` (the one V1 plan, granting the default config limits), `defaultEntitlement`, `canManageEntitlements` (superAdmin), `canGrantEntitlement` (superAdmin **and** subscriptions off **and** an active known plan; reasons notSuperAdmin/subscriptionsEnabled/unknownPlan/inactivePlan). Added `subscriptionsEnabled` to `CONFIG_FLAGS`/`DEFAULT_APP_CONFIG` (default **false**). New `plans.test.ts` (shared suite now **116**).
- **Server core:** `functions/src/plans.ts` — `evaluateEntitlementGrant` (CF `grantEntitlement`; superAdmin + subscriptions-off guard, emits the `users.entitlements` update for the audited write). Functions suite now **48**.
- **Rules:** `plans/{id}` — any signed-in member reads the catalog; all writes server-only (superAdmin via CF; entitlements live on `users.entitlements`, already server-only). New `plan.rules.test.ts` (member read, unauth denied, superAdmin client write denied). Rules suite now **76**.
- **Port + adapter:** `PlanRepository.listPlans`, `getEntitlement(uid)` (reads `users.entitlements`), `grantEntitlement` via callable.
- **UI:** `/admin/plans` — a "subscriptions off" status banner (V1 is free; entitlement changes are manual, superAdmin-only, audited), the plan catalog (free plan: name, price, limits, active), and an entitlement manager (uid lookup → current entitlement; superAdmin-only grant, disabled with a note when subscriptions are on). New **Plans** nav item (admin+). Preview seed with the free plan + two member entitlements.
- **Deferred (O-001):** the `grantEntitlement` callable (custom write + audit) is wired at the final production step; the console runs on the preview seed until then.
- **Verified:** `pnpm check` (shared 116, functions 48) + `next build` (89 routes) + `pnpm test:rules` (76) green; RTL plans-console screenshot with an entitlement lookup.

## Unit 6.3 — completed (delivered to `main`)

The staff broadcast composer: a localized message to an allow-listed audience, an audience dry-run before sending, idempotent batched dispatch, and a delivery summary (master spec Section 6.3).

- **Shared:** `broadcast.ts` — `BROADCAST_AUDIENCES` (all/verified/unverified/male/female), `Broadcast` + `AudienceMember`, `broadcastInputSchema` (localized title ≤80 / body ≤600, all locales required), `canSendBroadcast` (admin+), `matchesAudience` / `estimateAudience` (dry-run count; suspended/banned never receive), `canDispatch` (idempotency: only draft/failed may dispatch). New `broadcast.test.ts` (shared suite now **114**).
- **Server core:** `functions/src/broadcasts.ts` — `evaluateBroadcastDispatch` (CF `sendBroadcast`; admin-gated, validated, idempotent → `sending` + `targetedCount`; reasons notAllowed/invalid/alreadyDispatched) and `summarizeDelivery` (sent only when every recipient succeeded, else failed). Functions suite now **46**.
- **Rules:** `broadcasts/{id}` — admin-only read; all writes server-only (the broadcast CF composes/dispatches with audit). New `broadcast.rules.test.ts` (admin read, moderator/member denied, admin client write denied). Rules suite now **73**.
- **Port + adapter:** `BroadcastRepository.listBroadcasts` (admin read, newest-first), `estimateAudience` (CF dry-run callable), `sendBroadcast` (CF callable).
- **UI:** `/admin/broadcasts` — a composer (audience select, localized ar RTL / en·tr LTR title + body) with a **dry-run** that shows "N members would receive this", a **confirm-before-send** high-impact guard, and a recent-broadcasts history (status badge + delivery counts). New **Broadcasts** nav item (admin+). Preview seed with two past broadcasts + a seeded audience for the dry-run.
- **Deferred (O-001):** the `estimateBroadcastAudience` / `sendBroadcast` callables (server-side audience query, batched per-recipient notification fan-out, delivery summary + audit) are wired at the final production step; the console runs on the preview seed until then.
- **Verified:** `pnpm check` (shared 114, functions 46) + `next build` (86 routes) + `pnpm test:rules` (73) green; RTL composer screenshot with a live dry-run count.

## Unit 6.2 — completed (delivered to `main`)

The runtime app-configuration console: allow-listed feature flags, bounded numeric tunables, and editable localized content blocks, with an old→new audit on every change (master spec Section 6.2).

- **Shared:** `app-config.ts` — `CONFIG_FLAGS` (signups/discovery/chat), `CONFIG_LIMITS` (each with min/max/default bounds), `CONTENT_BLOCKS` (announcement/onboardingIntro, `CONTENT_MAX` 600), `AppConfig` + `DEFAULT_APP_CONFIG` (fallback so the app never depends on the doc existing), `canManageConfig` (admin+), and `validateConfigChange` (allow-list + integer bounds + localized-content validation; reasons unknownKey/outOfRange/invalidValue). New `app-config.test.ts` (shared suite now **108**).
- **Server core:** `functions/src/config.ts` — `evaluateConfigChange` (CF `updateConfig`; admin-gated, validated, returns the dotted `path` + `before`/`after` for the immutable audit). Functions suite now **42**.
- **Rules:** `appConfig/{doc}` — any signed-in member reads (the app reads config at runtime); all writes are server-only (admin via the content CF + audit). New `config.rules.test.ts` (member read, unauth denied, admin client write denied). Rules suite now **70**.
- **Port + adapter:** `ConfigRepository.getConfig` (reads `appConfig/platform`, merged over defaults) and `updateConfig` via the CF callable.
- **UI:** `/admin/config` — feature-flag toggles, numeric limit fields with their allow-listed range shown (out-of-range values are rejected and reverted with an inline error), and localized (ar RTL / en·tr LTR) content-block editors with per-block save. New **Configuration** nav item (admin+). Preview seed with an example announcement.
- **Deferred (O-001):** the `updateConfig` callable (transactional write + old→new audit) is wired at the final production step; the console reads defaults when configured until the doc is seeded, with the preview seed keeping it reviewable.
- **Verified:** `pnpm check` (shared 108, functions 42) + `next build` (83 routes) + `pnpm test:rules` (70) green; RTL config-console screenshot.

## Unit 6.1 — completed (delivered to `main`)

The admin console for compatibility questions: create/edit with a localized three-language editor, reorder, activate/archive, and an "affects existing answers" warning on breaking edits (master spec Section 6.1).

- **Shared:** `question-admin.ts` — `canManageQuestions` (admin+), `questionInputSchema` (localized text + labels required in ar/en/tr, 2+ options), `reorderQuestions` (swap + 1-based order normalize; edge no-op), `removedOptionIds`, `isBreakingQuestionChange` (option removed or active→archived). New `question-admin.test.ts` (shared suite now **102**).
- **Server core:** `functions/src/questions.ts` — `evaluateQuestionWrite` (CF `saveQuestion`; admin-only + schema-validated, returns `isNew` + `affectsExistingAnswers`) and `evaluateQuestionReorder` (CF `reorderQuestion`). Functions suite now **38**.
- **Rules:** `questionBank/{id}` — any signed-in member reads (onboarding renders the set); all writes are server-only (admin via the content CF + audit). New `question.rules.test.ts` (member read, unauth denied, admin client write denied). Rules suite now **67**.
- **Port + adapter:** `QuestionRepository.listQuestions` (ordered read incl. archived), `saveQuestion`, `reorderQuestion`, `setQuestionActive` via callables.
- **UI:** `/admin/questions` — a question-bank list (localized text in the active locale, options count, active/archived badge that toggles, up/down reorder) and an editor with the three-language text + option label inputs (Arabic RTL, English/Turkish LTR), add/remove option, active toggle, the breaking-change warning banner, and validation. New **Questions** nav item (admin+). Preview seed = starter set + one archived example.
- **Deferred (O-001):** the `saveQuestion` / `reorderQuestion` / `setQuestionActive` callables (transactional writes + audit) are wired at the final production step; the console reads empty when configured until the bank is seeded, with the preview seed keeping it reviewable.
- **Verified:** `pnpm check` (shared 102, functions 38) + `next build` (80 routes) + `pnpm test:rules` (67) green; RTL list + editor screenshots.

## Unit 5.5 — completed (delivered to `main`)

The user operations console: member search/filter, role assignment, and account-status changes (delivers master-spec unit 5.6; closes Phase 5's role-matrix + lockout, Gate G5).

- **Shared:** `user-admin.ts` — `ACCOUNT_STATUSES` (active/suspended/banned), `AdminUser`, `isLockedOut`, `canAssignRole` (superAdmin-only, never self; reasons notSuperAdmin/self/invalidRole), `canSetAccountStatus` (admin+ suspend/reinstate, ban and lifting a ban superAdmin-only, self and equal/greater-rank peers protected), `matchesUserQuery` / `matchesUserFilter`. New `user-admin.test.ts` (shared suite now **95**).
- **Server core:** `functions/src/users.ts` — `evaluateRoleAssignment` (CF `assignRole`; the claim is authoritative, the Firestore field a mirror) and `evaluateStatusChange` (CF `setAccountStatus`; emits the status + `revokeTokens` so a lockout kills open sessions, no revoke on reinstate). Functions suite now **34**.
- **Rules:** unchanged model, now explicitly tested — an owner cannot write their own `status` (no self-reinstate) and even a staff client cannot write another member's `role`/`status` (server-only). Suspended/banned lockout was already enforced via `isActive()` across profiles/verification/reports. Rules suite now **64**.
- **Port + adapter:** `AdminRepository.listUsers(filter)` (staff read of `users`, newest-first, filtered in-memory), `assignRole`, `setAccountStatus` via callables.
- **UI:** `/admin/users` — a search + role/status filter toolbar, a members list (role + status badges), and a detail drawer with the role selector (superAdmin-only, otherwise a locked note) and status actions gated by `canSetAccountStatus`, plus the audit note. The preview console now assumes **superAdmin** so the whole owner walkthrough (role assignment, bans) is reviewable; preview seed of four members across roles/statuses.
- **Deferred (O-001):** the `assignRole` / `setAccountStatus` callables (custom-claim writes, token revocation, audit) are wired at the final production step; the console reads empty when configured until members accrue, with the seed keeping it reviewable.
- **Verified:** `pnpm check` (shared 95, functions 34) + `next build` (77 routes) + `pnpm test:rules` (64) green; RTL users-console screenshot with role selector and gated status actions.

## Unit 5.4 — completed (delivered to `main`)

The member report affordance, the moderator reports queue, and the sanction actions.

- **Shared:** `report.ts` — `REPORT_REASONS` / `REPORT_STATUSES` / `REPORT_TARGET_TYPES`, `reportInputSchema` (`REPORT_DETAILS_MAX` 500), `canCreateReport` (not self), `canTransitionReport` (staff + non-terminal → in_review/resolved/dismissed; reasons notStaff / terminal / invalidTarget), `SANCTIONS` (dismiss/warn/unpublish/suspend/ban), `canApplySanction` (ban is admin+, the rest any staff), `sanctionAccountStatus` (suspend→suspended, ban→banned). New `report.test.ts` (shared suite now **88**).
- **Server core:** `functions/src/reports.ts` — `evaluateReportTransition(current,next,actor)` (CF `transitionReport`) emits `{status, handledBy, resolvedAt}` (`resolvedAt` set only on terminal), and `evaluateSanction(actorRole,sanction)` (CF `applySanction`) yields the `users.status` + audited sanction, refusing ban below admin. Functions suite now **30**.
- **Rules:** `reports/{id}` — an active member creates the exact `open` shape (`reporterUid == self`, `targetUid != self`); staff read; client update/delete denied (transitions + sanctions are server-only). `firebase/tests/report.rules.test.ts` (6 tests); rules suite now **62**.
- **Ports + adapters:** `ReportRepository.createReport` (member `addDoc` of the open shape); `AdminRepository.listReports` (staff read, oldest-open-first FIFO via the `reports` index), `transitionReport` + `applySanction` via callables; `getQueueCounts` now also counts open reports.
- **UI:** `report-button.tsx` on the profile detail (reason + details → files an open report); `/admin/reports` — a reports list + triage detail (startReview / dismiss) and role-gated sanction buttons (`canApplySanction`), with the audit note. **Reports** nav badge = open count. Loading/empty/error + preview seed states.
- **Deferred (O-001):** the `transitionReport` / `applySanction` callables and the `users.status`-enforcing rules are wired at the final production step; the console reads empty when configured until then, with the preview seed keeping it reviewable.
- **Verified:** `pnpm check` (shared 88, functions 30) + `next build` + `pnpm test:rules` (62) green; RTL reports-queue screenshot with role-gated sanctions.

## Unit 5.3 — completed (delivered to `main`)

The moderator photo-moderation queue and the approve/reject decision path.

- **Shared:** `canDecidePhoto` (staff + pending; notStaff / notPending), `photoModerationOutcome` (decision → moderation state), `PHOTO_DECISIONS`. New photo-decision tests (shared suite now **82**).
- **Server core:** `functions/src/photos.ts` `evaluatePhotoDecision` (CF `decidePhoto`) — validates staff+pending, emits the moderation state + reason + `decidedBy`, and `publishBlurred` (true only on approve, so the blurred variant is published; a rejected photo is never published). Functions suite now **26**.
- **Port + adapter:** `AdminRepository.listPhotoQueue` (staff collection-group read of pending photos across members, oldest-first) and `decidePhoto` via the CF callable.
- **UI:** `/admin/photos` — a grid of pending photos (blurred/locked placeholders labelled by owner uid) with Approve / Reject (reason) per photo, and the "approval publishes only the blurred variant; originals never staff-cached" note. New **Photos** nav item (badge = pending count), moderator+. Loading/empty/error + preview states.
- **Deferred (O-002):** the photos metadata collection + collection-group index + Cloudinary blurred-variant delivery; the queue reads empty when configured until then, and the seed keeps the console reviewable in preview.
- **Verified:** `pnpm check` + `next build` (77 routes) + `pnpm test:rules` (56) green; RTL photo-queue screenshot.

## Unit 5.2 — completed (delivered to `main`)

The moderator verification review queue and the approve/reject decision path.

- **Shared:** `canDecideVerification` (staff + pending; reasons notStaff / notPending), `verificationOutcome` (decision → request/profile status), `VERIFICATION_DECISIONS`. **verification.test.ts** covers submit/decide/outcome (shared suite now **80**).
- **Server core:** `functions/src/verification.ts` `evaluateVerificationDecision` (CF5) — validates staff+pending, then emits the request update (status/reason/decidedBy), the mirrored `profiles.verification`, and the notification key. Functions suite now **23**.
- **Port + adapter:** `AdminRepository.listVerificationQueue` (staff read of pending, oldest-first via the `verificationRequests` index) and `decideVerification` via the CF5 callable.
- **UI:** `/admin/verifications` is now a live queue + detail — pending list (select), private evidence placeholder ("staff short-lived URL, never stored"), an audit note, and Approve / Reject (reject requires a reason). Decisions optimistically remove the item; loading/empty/error states covered. Preview seeds three pending requests.
- **Rules:** unchanged — `verificationRequests` is staff-readable and client decisions are denied (server-only); the Unit 2.5 rules tests still hold.
- **Verified:** `pnpm check` + `next build` (74 routes) + `pnpm test:rules` (56) green; RTL queue + reject-flow screenshots.

## Unit 5.1 — completed (delivered to `main`; opens Phase 5)

The role-gated operations console shell and the dashboard.

- **Shared (`role.ts`):** `ROLES`, `isStaffRole`/`isAdminRole`/`isSuperAdminRole`, and `roleAtLeast` — one role ordering shared by the web app, Functions, and (mirrored) the rules. **2 unit tests** (shared suite now **77**).
- **Port + adapter:** `AdminRepository.getQueueCounts` (staff-scoped aggregate reads) — counts pending verifications via `getCountFromServer` (staff-readable, Unit 2.5); photo/report queues count 0 until their units (5.2/5.3) rather than guessing.
- **Console:** `AdminShell` now role-gates the sidebar (`minRole` per item — e.g. Users is admin+), drives badges from live queue counts, and shows the signed-in staff role. The dashboard (`components/admin/admin-dashboard.tsx`) shows queue tiles + a system-health grid (each area marked "pending wiring" until O-001) with honest loading/error/preview states. Role gating is UX only — authorization stays server-side via custom-claim rules (A-008).
- **Auth:** the admin layout keeps `RequireAdmin`; roles come from custom claims (`AuthUser.role`). In preview the console assumes an `admin` so it stays navigable.
- **Verified:** `pnpm check` + `next build` (74 routes) + `pnpm test:rules` (56) green; RTL admin-dashboard screenshot (role badge, gated nav, live counts).

## Unit 4.5 — completed (delivered to `main`; closes Phase 4 / gate G4, pending deferred wiring)

FCM permission education, the device-token lifecycle, and throttled message push.

- **Shared (`push.ts`):** `shouldSendMessagePush` (throttle: ≤1 push per match per 5 min; in-app notifications are never throttled), `PUSH_THROTTLE_MINUTES`, `DeviceToken`, and `PushPermission`. **3 unit tests** (shared suite now **75**).
- **Server cores:** `functions/src/push.ts` `shouldPushMessage` (throttle) and `isInvalidTokenError` / `INVALID_TOKEN_CODES` (device-token pruning on FCM errors). Functions suite now **20**.
- **Port + adapter:** `PushService` (`isSupported`, `currentPermission`, `enable`, `disable`); the FCM adapter requests the browser permission on the user's action and defers token registration (VAPID + service worker, O-001).
- **UI:** a `PushPrompt` education card on `/app/notifications` — permission is requested only when the member clicks **Enable**, never on load; hides once granted/denied/dismissed. Honest preview simulation.
- **Rules:** device tokens confirmed owner-only (private per-device docs under `users/{uid}/devices/{deviceId}`). **2 emulator tests** added — rules suite now **56**.
- **Verified:** `pnpm check` + `next build` (74 routes) + `pnpm test:rules` (56) green; RTL push-prompt screenshot.

## Unit 4.4 — completed (delivered to `main`)

Independent, revocable photo-reveal controls and the authorization for short-lived original access.

- **Shared (`reveal.ts`):** `isRevealingOwn`, `counterpartyRevealed`, `canAccessRevealedPhotos` (member + counterparty revealed; reasons notParticipant / notRevealed), and `canSetPhotoReveal` (participant of an active match). **6 unit tests** including a revocation-denies-next-request case (shared suite now **72**).
- **Server cores:** `functions/src/reveal.ts` `evaluateSetPhotoReveal` (targets the actor's own `photoReveal.{uid}`) and `evaluateRevealAccess` (the authority `getRevealedPhotoUrls` enforces before returning short-lived signed Cloudinary URLs — originals never public, never cached). Functions suite now **18**.
- **Port + adapter:** `MatchRepository.setPhotoReveal` and `getRevealedPhotoUrls` via callables.
- **UI:** a `PhotoRevealPanel` in the conversation — an independent "reveal my photos" switch (disabled when the match is closed) and the counterparty's photo state (blurred/locked by default, or a "revealed" state with a signed-link note). Preview seeds the counterparty as revealed to demonstrate both sides.
- **Deferred (O-001/O-002):** Cloudinary signed-URL generation and the `setPhotoReveal`/`getRevealedPhotoUrls` callables' Admin SDK wiring; originals remain private/authenticated on Cloudinary.
- **Verified:** `pnpm check` + `next build` (74 routes) + `pnpm test:rules` (54) green; RTL reveal-panel screenshots (toggle off/on).

## Unit 4.3 — completed (delivered to `main`)

The close-match flow and robust conversation states, on top of the 4.2 soft-delete window.

- **Shared:** `canCloseMatch` (either participant may close an active match; reasons notParticipant / alreadyClosed). **3 unit tests** (shared suite now **67**).
- **Server core:** `functions/src/matches.ts` `evaluateCloseMatch` — the CF `closeMatch` core producing `{ status:"closed", closedBy, closedReason:"user_closed" }` for a participant, refusing non-participants and already-closed matches. Functions suite now **14**.
- **Port + adapter:** `MatchRepository.close` via the `closeMatch` callable.
- **UI:** the conversation header gains a confirm-guarded **Close match** action; a closed match shows a "Closed" badge, keeps the message history **read-only**, and replaces the composer with a read-only notice. Sending is blocked client-side when closed (and server-side: the message-create rule already requires `match.status == active`).
- **States covered:** loading skeletons, empty thread, closed (read-only), and preview.
- **Verified:** `pnpm check` + `next build` (74 routes) + `pnpm test:rules` (54) green; RTL closed-conversation screenshot.

## Unit 4.2 — completed (delivered to `main`)

Real-time text chat inside a match, unread behaviour, and message moderation metadata.

- **Shared (`chat.ts`):** `ChatMessage` type, length bounds (1–1000), `isValidMessageText`, `canDeleteMessage` (own + within 15 min), `containsBannedWord` (client pre-check), and `messagePreview`. **9 unit tests** covering length/delete-window/banned/preview (shared suite now **64**).
- **Server core:** `functions/src/chat.ts` `evaluateMessageModeration` (authoritative banned-word flag) and `buildMatchUpdateOnMessage` (preview + which participant's unread to increment) — the onMessageCreate trigger core. Functions suite now **12**.
- **Port + adapter:** `ChatRepository` (`listen` real-time `onSnapshot`, `send` exact schema, `softDelete`).
- **Rules:** `matches/{pairKey}/messages/{id}` — active participants create the exact schema (senderUid == self, 1–1000 chars, `deleted:false`, `moderation.flagged:false`, server time, match active); sender soft-deletes only their own within 15 min (flip `deleted`); moderation/hard-delete/other-field writes denied; participants read. **7 emulator tests** (send/read, non-participant deny, spoof deny, pre-flag deny, length deny, closed-match deny) — rules suite now **54**.
- **UI:** `/app/matches/[id]` conversation — real-time bubbles (mine vs theirs), soft-delete on own recent messages ("message removed"), flagged badge, an Enter-to-send composer with a **client banned-word block**, and a privacy note. Preview seed streams a demo thread.
- **Verified:** `pnpm check` + `next build` (74 routes) + `pnpm test:rules` (54) green; RTL conversation + banned-word screenshots.

## Unit 4.1 — completed (delivered to `main`; opens Phase 4)

The accepted-request transaction that creates the match, and the member match list.

- **Shared (`match.ts`):** `Match` type (uids, denormalized participants, status, photoReveal, unread, lastMessage*, requestId), `MATCH_STATUSES`, `otherUid`/`isParticipant`, and `buildAcceptedMatch` — the match document the CF7 accept writes, keyed by `pairKey` so a replayed accept is idempotent. **4 unit tests** (shared suite now **59**).
- **Server core:** `functions/src/matches.ts` `evaluateAccept` composes `evaluateTransition("accept")` + `buildAcceptedMatch` — no match doc is produced unless the transition is authorized and pending. Functions suite now **10** (idempotency + unauthorized/non-pending covered).
- **Port + adapter:** `MatchRepository` (`listMatches` via the `matches` composite index — uids CONTAINS + status + lastMessageAt DESC; `getMatch`).
- **Rules:** `matches/{pairKey}` — the two participants may read; **all writes denied** to clients (match creation is server-only). **5 emulator tests** (participant read, non-participant + unauth deny, client-create deny, client-update deny) — rules suite now **47**.
- **UI:** `/app/matches` list (counterparty, last-message preview, unread badge, protected avatar) linking to `/app/matches/[id]`, which is an honest "chat coming next" placeholder until Unit 4.2. Preview seed makes the list demonstrable.
- **Verified:** `pnpm check` + `next build` (74 routes) + `pnpm test:rules` (47) green; RTL match-list screenshot.

## Unit 3.6 — completed (delivered to `main`; closes Phase 3 / gate G3, pending deferred wiring)

The block foundation (instant, unilateral, silent) and the in-app notifications surface.

- **Shared:** `block.ts` (`Block`, `canBlock` — no self-block) and `notification.ts` (`AppNotification` with i18n `titleKey`/`bodyKey`/`params`, `NOTIFICATION_TYPES`, `unreadCount`). **3 unit tests** (shared suite now **55**).
- **Server cores:** `functions/src/blocks.ts` `evaluateBlock` (CF10 core — the callable atomically writes `blocks/{actor}/blocked/{target}` and closes any active match with `closedReason:"block"`). Functions suite now **7**.
- **Ports + adapters:** `BlockRepository` (block/unblock via CF10 callables; owner-only `listBlocked`) and `NotificationService` (`list`; `markRead` flips only `read`). `blocks`/`notifications` reads are Firestore; writes stay server-only.
- **Rules:** `blocks/{uid}/blocked/{targetUid}` owner-read, writes denied; notifications owner-read + owner may flip only `read`. **8 emulator tests** (block read/deny/create-deny; notification read/deny, flip-read allowed, other-field deny, create deny) — rules suite now **42**.
- **UI:** `/app/notifications` center (unread dots, mark-all-read, localized catalog copy, deep links) with an **unread badge on the shell bell**; `/app/settings/blocked` list with unblock (+ a Settings entry); a **block affordance** on the profile detail (confirm → CF10). Preview seeds make all of it demonstrable.
- **Discovery integration:** blocked members are already excluded both directions via the viewer's pre-unioned `blockedUids` in `isEligibleCandidate` (Unit 3.1).
- **Verified:** `pnpm check` + `next build` (73 routes) + `pnpm test:rules` (42) green; RTL notifications + blocked-list screenshots.

## Unit 3.5 — completed (delivered to `main`; CF7 callables deployed in the wiring step, O-001)

The request center with Received | Sent tabs and the accept / decline / withdraw / expire transitions.

- **Shared:** `canTransitionRequest` (accept/decline are the recipient's, withdraw the sender's, only `pending` moves; reasons: notParticipant / notAuthorizedForAction / notPending) and `isRequestExpired` (14-day window). **7 unit tests** for the two-user permission matrix + expiry boundary (shared suite now **53**).
- **Server core:** `functions/src/connection-requests.ts` `evaluateTransition` (CF7 core) resolves the next status for the deployed callables, which write `{ status, respondedAt }` + counters, and on accept create `matches/{pairKey}` (Unit 4.1). Functions suite now **5**.
- **Port + adapter:** `ConnectionRequestRepository` gains `listReceived` / `listSent` (indexed queries) and `respond` / `withdraw` (CF7 callables).
- **UI (`components/requests/request-center.tsx`):** `/app/requests` with Received | Sent tabs; each request shows the counterparty, message, and a status badge; received-pending gets accept/decline, sent-pending gets withdraw; per-tab empty, loading, and error states. A preview seed makes the transitions demonstrable (local state) with a visible preview badge.
- **Rules:** unchanged from 3.4 — client transitions stay denied (server-only); the deny-transition test still holds.
- **Verified:** `pnpm check` + `next build` (72 routes) + `pnpm test:rules` (34) green; RTL Received + Sent screenshots.

## Unit 3.4 — completed (delivered to `main`; CF6 callable deployed in the wiring step, O-001)

Written connection-request composer with the send limits, dedupe, cooldown, and server-only enforcement.

- **Shared (`connection-request.ts`):** `ConnectionRequest` + statuses, `makePairKey`, `connectionMessageSchema`, the limits/cooldown constants, and `canSendRequest` — the authoritative send decision (self, sender/recipient eligibility, one-live-pending dedupe, already-connected, 90-day decline cooldown, pending & daily limits). **16 unit tests** cover every reason and the cooldown/limit boundaries and a race-at-cap case (shared suite now **46**).
- **Server enforcement:** `functions/src/connection-requests.ts` `evaluateSendRequest` is the CF6 transaction core (re-uses `canSendRequest`, emits the strictly-shaped `pending` document) — SDK-free and unit-tested (functions suite now **3**). The deployed callable wraps it in a Firestore transaction at wiring time.
- **Rules:** new `connectionRequests/{id}` block — the two participants + staff may **read**; **all writes are denied** to clients (server-only via CF6/CF7). **7 emulator tests** (sender/recipient/staff read, non-participant + unauth deny, client-create deny, client-transition deny) — rules suite now **34**, stable.
- **Port + adapter:** `ConnectionRequestRepository` (`send` via the CF6 callable; `countPendingSent` + `getLatestForPair` for the client preflight) and its Firestore/Functions adapter; `firebaseFunctions()` added to the client (with emulator wiring).
- **Composer UI (`request-composer.tsx`):** opened from the profile detail's now-active CTA — message textarea (validated + counted), on-platform privacy note, shared-decision preflight with localized denial messages, and honest sent/error states (a simulated outcome in preview).
- **Verified:** `pnpm check` + `next build` (72 routes) + `pnpm test:rules` (34) green; RTL composer screenshot.

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

**Final production-wiring step (O-001 / O-002)** — the single remaining step before launch. Provide real environment secrets (Firebase web config `NEXT_PUBLIC_FIREBASE_*`, VAPID, reCAPTCHA App Check site key, `NEXT_PUBLIC_SITE_URL`; rotated `FIREBASE_*` server credentials; Cloudinary keys), connect the real Firebase project + Cloudinary, deploy the Cloud Functions (wrapping the SDK-free cores built across Phases 2–7), enable App Check enforcement, rotate the previously-leaked service-account key, and set budgets/region per `docs/SECURITY.md` + `docs/DECISIONS.md`. This closes gate G0 and enables production. See the checklist below.

### Final production-wiring checklist (deferred throughout per O-001/O-002)

- **Secrets:** `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_FIREBASE_VAPID_KEY`, `NEXT_PUBLIC_APPCHECK_SITE_KEY`, `NEXT_PUBLIC_SITE_URL`; server `FIREBASE_*` (rotated); Cloudinary `CLOUDINARY_*`.
- **Deploy Cloud Functions** consuming the cores in `functions/src/*` (CF5/CF6/CF7/CF10, decidePhoto, transitionReport/applySanction, assignRole/setAccountStatus, saveQuestion/reorderQuestion/setQuestionActive, updateConfig, sendBroadcast/estimateBroadcastAudience, grantEntitlement, exportAdminTable/refreshSystemHealth, exportMyData/deleteMyAccount) + Firestore composite indexes.
- **App Check:** provide the reCAPTCHA site key and enable enforcement (Firestore/Functions).
- **Rotate the leaked service-account key**; wire Cloudinary private/authenticated delivery + signed reveal URLs.
- **Ops:** Firebase/Vercel budget alerts, Function concurrency/max-instance caps, region/data-residency (D-004), CSP nonce tightening.

### Deferred to the final "production wiring" step (O-001)

- Provide, as environment secrets: Firebase web config (`NEXT_PUBLIC_FIREBASE_*`, VAPID, reCAPTCHA App Check site key), rotated server credentials (`FIREBASE_*`), and Cloudinary keys.
- Connect to the real Firebase project + Cloudinary, region/data-residency (D-004), billing guardrails (D-003), then deploy. This closes gate G0 and enables production.
