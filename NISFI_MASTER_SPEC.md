# NISFI (نِصفي) — Master Documentation & Execution Specification

| Field | Value |
|---|---|
| Document version | 2.0 |
| Date | 2026-07-20 |
| Product | Nisfi (نِصفي) — serious marriage-oriented matchmaking platform |
| Owner | Karim Othman |
| Status | INTERACTIVE EXECUTION BASELINE — owner approves each work unit |
| Target executor | Codex or another capable coding agent — see Sections 16–17 before writing code |

---

## 0. How to Use This Document

This is the **single source of truth** for the Nisfi project. It is both a product specification and an interactive execution contract. Any AI or developer implementing this project MUST:

1. Read Sections 1–16 fully before writing code.
2. Follow Section 17 (Constraints for AI Execution) as hard rules.
3. Implement strictly by phase and by work unit (Section 16). Only **one work unit** may be active at a time. Do not start the next unit until the owner has reviewed the current result.
4. Keep the collaboration conversational: explain the current target, implement it, run the agreed checks, present the result and any material trade-offs, then stop for the owner's decision.
5. Never invent features, rename entities, change architecture/data/roles/security, or make a material visual decision without explicit written approval from the owner.
6. When blocked or genuinely ambiguous, ask one focused question with a recommended option and its consequence. Do not guess, hide uncertainty, or patch around the issue.
7. Record every approved material decision in `docs/DECISIONS.md`; record work-unit status and evidence in `docs/PHASE_STATUS.md`.
8. Commit and push directly to `main` only at the **phase close gate**, after the owner explicitly approves the phase. Work-unit previews and tests happen before that push.

---

## 1. Product Vision

### 1.1 One-line definition
Nisfi is a **privacy-first, verification-first web platform for serious, marriage-intent matchmaking**, built for Arabic-speaking Muslims worldwide (with a focus on the Arab diaspora in Türkiye and Europe, plus MENA), in Arabic, English, and Turkish.

### 1.2 The name
- Brand: **Nisfi — نِصفي** ("my other half", echoing the concept of marriage completing "half of one's deen").
- The name is a configurable constant (`APP_NAME`) — see Section 18. Never hardcode the brand string in components.

### 1.3 Core differentiators (these define the product — never dilute them)
1. **No casual swiping.** Discovery produces thoughtful profiles; contact happens via a written **Connection Request**, not a swipe.
2. **Photos are blurred by default.** A member's photos are revealed only when that member explicitly grants reveal to a specific match.
3. **Verification before contact.** A member cannot send or accept connection requests until their selfie verification is approved.
4. **Serious-intent profile.** Religion & practice, marriage timeline, relocation willingness, and values questions are first-class profile data, not afterthoughts.
5. **Safety & moderation built-in from day one.** Reporting, blocking, moderator queues, and audit logs ship in V1.
6. **Guardian (wali) involvement** is respected as a cultural option (V2 feature, but modeled in V1 data).

### 1.4 What Nisfi is NOT
- Not a casual dating app. No "hot or not" mechanics, no gamified swiping, no ephemeral content.
- Not a social network. No public feeds, likes, or follower counts.
- Not anonymous chat. Every conversation begins from an accepted, verified connection request.

---

## 2. Personas

| # | Persona | Summary | Primary needs |
|---|---|---|---|
| P1 | **Omar, 29** — Palestinian engineer in Istanbul | Busy professional, wants marriage within 1–2 years, values privacy at work | Verified profiles, serious filters (religiosity, relocation), Arabic UI |
| P2 | **Aisha, 26** — Syrian pharmacist in Gaziantep | Cautious about photos and harassment; family involvement matters | Blurred photos, strict verification, block/report, future wali access |
| P3 | **Yusuf, 34** — Turkish-Arab bilingual, divorced with one child | Needs honest filters (marital status, children acceptance) | Transparent profiles, Turkish UI, no stigma UX |
| P4 | **Moderator (staff)** | Reviews verifications, photos, and reports | Fast queues, clear actions, audit trail |
| P5 | **Admin / SuperAdmin (owner)** | Runs the platform | Dashboards, user management, config without redeploys |

---

## 3. Scope

### 3.1 V1 (this document's build target)
- Web app (responsive, mobile-first) — Next.js.
- Email/password auth with mandatory email verification.
- Multi-step profile builder + compatibility questions (admin-managed question bank).
- Selfie verification with **manual moderator review**.
- Discovery with filters (opposite gender only) + profile detail page.
- Connection Requests (send with message → accept/decline/withdraw) with free-tier limits.
- Matches + real-time 1:1 chat (text only in V1) with per-match photo reveal.
- Blocking, reporting, moderation queues, user sanctions (warn/suspend/ban).
- Notifications: in-app center + FCM web push.
- Complete role-gated operations/admin panel per F10: dashboard, users/cases, verification and photo queues, reports/sanctions, questions/content/config, broadcasts, plans/entitlements, audit, exports, and health.
- i18n: `ar` (default, RTL), `en`, `tr`. Public marketing landing in all three.
- Account deletion (KVKK/GDPR compliant anonymization).
- Subscription **data model designed and stored, but payments/UI disabled** behind a feature flag.

### 3.2 V2 (design-aware, do NOT implement in V1)
- Native iOS (SwiftUI) and Android (Kotlin/Compose) apps consuming the same Firebase backend.
- Paid subscriptions (Stripe and/or iyzico) + entitlement enforcement UI.
- Guardian (wali) read-only chat access via invitation.
- Voice notes in chat; icebreaker prompts; daily curated suggestions (scheduled function).
- Automated photo/NSFW moderation (Cloud Vision) replacing part of manual review.
- Success stories module.

### 3.3 Explicitly out of scope (all versions unless re-approved)
- Video calls, live streaming, public feeds, group chats, ads.

---

## 4. Technology Stack (fixed — do not substitute)

| Layer | Choice | Notes |
|---|---|---|
| Web framework | **Next.js 16.x (App Router)** + **TypeScript (strict)** | Use the current supported 16.x patch at Phase 0; deployed on Vercel |
| Styling | **Tailwind CSS** + shadcn/ui components | RTL-aware (logical properties: `ms-`, `me-`, `ps-`, `pe-`) |
| i18n | **next-intl** | Locales: `ar` (default), `en`, `tr`; routing `/[locale]/…` |
| Client data | **TanStack Query** + Firestore realtime listeners (chat/notifications only) | |
| Forms/validation | **react-hook-form + zod** | Zod schemas shared with Functions where possible |
| Auth | **Firebase Authentication** | Email/password; email verification required |
| Database | **Cloud Firestore** | Model in Section 10 |
| Files | **Firebase Storage** | Paths in Section 10.14 |
| Server logic | **Cloud Functions (Node 22, TypeScript)** | Section 12; same Node major for local/CI where practical |
| Push | **FCM (web push)** | |
| Abuse protection | **Firebase App Check** (reCAPTCHA v3/Enterprise) | Enforced on Firestore/Storage/Functions |
| Analytics | Firebase Analytics (basic events only) | |
| Monorepo/runtime | Single repo: `apps/web`, `functions`, `packages/shared` | **Node 22 LTS + pnpm 11**, exact pnpm version pinned in `packageManager` |

Environment variables via `.env.local` (never committed). Firebase project IDs, keys, and VAPID keys are provided by the owner at setup time — **never invent or hardcode credentials**.

Version baseline (verified 2026-07-20): Next.js 16 is the current stable major; pnpm 11 requires Node 22+; Firebase Functions supports Node 22. Therefore Node 22 is the common runtime baseline even though newer Node LTS releases may exist. Pin exact tool/package versions during Phase 0 for reproducibility and upgrade only through an approved, tested decision. Official references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Next.js 16 release](https://nextjs.org/blog/next-16), [Firebase runtime management](https://firebase.google.com/docs/functions/manage-functions), [pnpm installation/compatibility](https://pnpm.io/installation).

---

## 5. Architecture — Backend-Agnostic Layer (mandatory)

The owner requires the backend to be **replaceable** (e.g., Firebase → Supabase later) without rewriting product logic.

### 5.1 Layering rule
```
apps/web/src/
  core/
    domain/        # Pure TS types & entities (no imports from firebase or next)
    ports/         # Interfaces (contracts) — see 5.2
    usecases/      # Optional thin orchestration over ports
  infrastructure/
    firebase/      # THE ONLY place 'firebase/*' may be imported in the web app
      auth.service.ts
      profile.repository.ts
      request.repository.ts
      match.repository.ts
      chat.repository.ts
      moderation.repository.ts
      notification.service.ts
      storage.service.ts
      config.repository.ts
  app/             # Next.js routes — consume ports via a DI container/hooks
  components/
  lib/
```

**Hard rule:** `import ... from "firebase/..."` is forbidden outside `infrastructure/firebase/**`. Add an ESLint `no-restricted-imports` rule enforcing this in Phase 0.

### 5.2 Ports (interfaces) — minimum set
`AuthService`, `SessionService`, `ProfileRepository`, `VerificationRepository`, `DiscoveryRepository`, `ConnectionRequestRepository`, `MatchRepository`, `ChatRepository`, `BlockRepository`, `ReportRepository`, `NotificationService`, `StorageService`, `AppConfigRepository`, `AdminRepository`.

Each port exposes domain types only (from `core/domain`) — never Firestore `DocumentSnapshot`, `Timestamp` (convert to `Date`/ISO strings at the boundary), or SDK types.

---

## 6. Roles & Permissions

Roles are stored as **Firebase custom claims** (source of truth) and mirrored in `users/{uid}.role` for UI/queries. Role changes happen ONLY via the `setUserRole` callable function (superAdmin only).

| Capability | user | moderator | admin | superAdmin |
|---|---|---|---|---|
| Use the product (profile, discovery, requests, chat) | ✅ | ✅ | ✅ | ✅ |
| View operations dashboard/health and user case context | — | ✅ | ✅ | ✅ |
| Review verification/photo queues; add internal case notes | — | ✅ | ✅ | ✅ |
| Handle reports; warn/suspend users | — | ✅ | ✅ | ✅ |
| Ban/unban users; manage questions/content/config; send broadcasts | — | — | ✅ | ✅ |
| Run approved privacy-safe operational exports | — | — | ✅ | ✅ |
| Assign roles; view full audit log; mutate plans/entitlements | — | — | — | ✅ |

Account `status` values: `active` | `suspended` (temporary, auto-lift date) | `banned` (permanent) | `deleted` (anonymized). Suspended/banned users can authenticate only to see a status screen; all product surfaces are locked and security rules deny writes.

---

## 7. Feature Specification (V1)

### F1 — Authentication & Onboarding
- Sign up: email + password (zod: min 8 chars, 1 letter, 1 digit). Locale captured from URL.
- Email verification is mandatory: unverified users are redirected to a "verify your email" screen; resend with 60s cooldown.
- On first login after verification → Profile Builder (F2). The app shell is inaccessible until `profile.completionScore >= 80` AND required fields are set.
- Password reset via Firebase standard flow (localized emails: configure Firebase templates per locale where supported; otherwise default + in-app copy).
- Session: after Firebase client authentication, exchange the ID token through a CSRF-protected server endpoint for a secure `HttpOnly`, `Secure`, `SameSite=Lax` Firebase session cookie with bounded lifetime. Sign-out clears the cookie and client session; sensitive account changes may revoke server sessions.
- Next.js `proxy.ts` may perform an early cookie-presence redirect, but it is **not** the authorization boundary. Protected layouts/server handlers verify the session cookie and claims; Firestore/Storage rules and Functions re-authorize data/actions. Email verification and account status are checked from verified server claims/data, not trusted client state.
- Sign out from user menu.

### F2 — Profile Builder (multi-step wizard, resumable)
Steps (each saves on "Next"; user can leave and resume):
1. **Basics:** first name (displayName, 2–30 chars), gender (immutable after save), date of birth (18+ enforced; only age & birth year are public), country of residence, city, nationality, spoken languages (multi).
2. **Background:** marital status (`single|divorced|widowed`), has children (bool + count), education level, occupation, height (optional), smoking (`no|occasionally|yes`).
3. **Religion & practice:** practice level (`practicing|moderate|learning`), prayer (`always|mostly|sometimes|rarely`), hijab (females: `yes|no|sometimes`), sect (optional, free-select from config list), halal-conscious lifestyle (bool).
4. **Marriage plan:** timeline (`within_1_year|1_2_years|flexible`), willing to relocate (`yes|no|maybe`), accepts partner with children (`yes|no|maybe`), living arrangement preference (optional).
5. **About me:** bio (50–600 chars, moderated), what I'm looking for (50–400 chars).
6. **Compatibility questions:** rendered dynamically from `questionBank` (active questions, ordered). Answer types: `single_choice`, `multi_choice`, `scale_1_5`. Answers stored in `profiles.{answers}`.
7. **Photos:** upload 1–5 photos (jpeg/png/webp, ≤ 5 MB each, client-side resize to max 1600px). Every photo enters `pending` state → moderator approval (F8). Public rendering ALWAYS uses the blurred variant unless reveal is granted (F7).

`completionScore` (0–100) computed client-side + validated in Functions: required steps 1–5 = 80 points, questions = 10, ≥1 approved photo = 10.

### F3 — Identity Verification (manual, V1)
- Entry: banner + `/app/verification` page. User takes/uploads a selfie following on-screen pose instructions (e.g., "peace sign near chin" — instruction text comes from `appConfig.verificationInstruction`, rotated by admin).
- Creates `verificationRequests` doc (status `pending`) + uploads selfie to a private Storage path readable ONLY by staff.
- Moderator approves/rejects (with reason enum: `face_mismatch|instruction_not_followed|low_quality|inappropriate`). Function mirrors result to `profiles.verification.status` and notifies the user.
- Gate: `verification.status == "verified"` is REQUIRED to send or accept connection requests. Unverified users can still browse discovery (read-only CTA prompts them to verify).
- Selfie is NOT shown on the profile; it is retained for audit for 90 days after decision, then deleted by scheduled function.

### F4 — Discovery
- Route `/app/discover`. Shows ONLY: opposite gender, `visibility == "visible"`, `verification.status == "verified"`, account `active`, not blocked (either direction), not self, not already matched.
- Filters (persisted per user in `users.settings.discoveryFilters`): age range, country (multi), city (text), nationality (multi), languages, marital status, has children, practice level, prayer, relocation willingness, marriage timeline, education. Sort: newest | recently active.
- Pagination: cursor-based (`limit 20`). Firestore composite indexes listed in Section 10.13.
- Card shows: blurred primary photo, first name, age, city/country, 3 highlight chips (practice level, timeline, education). Click → full profile page `/app/profile/[uid]` (all public fields + answers; photos blurred; "Send Connection Request" CTA).
- Block/report available from the profile page.

### F5 — Connection Requests
- Send: verified user opens a target profile → writes an intro message (50–300 chars) → creates `connectionRequests` doc (`pending`).
- Constraints are enforced transactionally by callable Functions; Firestore rules deny direct client creates/status mutations on `connectionRequests`:
  - One live request per pair ever pending (dedupe by `pairKey` = sorted `uid_uid`).
  - Cannot send to someone you blocked / who blocked you, to same gender, to unverified/hidden/suspended profiles.
  - Free-tier limit: max `appConfig.limits.maxPendingSent` (default **3**) pending sent requests at a time; max `appConfig.limits.dailySends` (default **5**) per 24h.
- Recipient sees request in `/app/requests` (Received | Sent tabs) with sender's profile + message. Actions call server operations: **Accept** (atomically validates and creates the match), **Decline** (optional reason kept private), sender can **Withdraw** while pending.
- Auto-expiry: pending > 14 days → status `expired` (scheduled function).
- Declined pair: sender cannot re-send for 90 days (enforced by checking latest request for `pairKey`).

### F6 — Matches & Chat
- A match is created ONLY inside the accepted-request server transaction (client can never create matches). Match id = `pairKey`.
- `/app/matches`: list ordered by `lastMessageAt` desc, with unread badge.
- `/app/matches/[id]`: real-time chat (Firestore listener). Text messages 1–1000 chars. Sender can delete own message within 15 min (soft delete → "message removed").
- Client-side banned-word check (from `appConfig.bannedWords[locale]`) blocks send with a warning; server Function re-checks and flags (`moderation.flagged=true`) for moderator review — flagged messages still deliver in V1 unless the author is sanctioned.
- Chat header: match's profile summary, photo-reveal control (F7), report & block, "Close match" (closes chat for both, keeps history read-only).
- Typing indicator and read receipts: OUT of V1 (do not implement). Unread counts only.

### F7 — Photo Privacy & Reveal
- Storage keeps two variants per approved photo: `original` (private) and `blurred` (generated by Function using sharp, gaussian blur, downscaled).
- All UI surfaces render the blurred variant by default.
- Inside a match, each side has an independent toggle: "Reveal my photos to this person" (`matches.photoReveal[uid] = true`, revocable).
- When reveal is true, the viewer's client requests original photo URLs via callable `getRevealedPhotoUrls(matchId)` which validates membership + reveal flag and returns short-lived signed URLs (15 min). Originals are NEVER publicly readable and never cached in Firestore.

### F8 — Safety, Reports & Moderation
- **Block:** instant, unilateral, silent. A callable server operation atomically creates the block relationship and closes any active match; direct client writes are denied. It removes both from discovery and prevents requests. Managed in `/app/settings/blocked`.
- **Report:** from profile, request, or message. Reason enum: `fake_profile|inappropriate_photos|harassment|scam|underage|other` + details (≤ 500 chars). Creates `reports` doc; reporter gets confirmation; moderators notified.
- **Moderator queues** (in admin panel): Verification queue (F3), Photo queue (approve/reject each pending photo with reason), Reports queue (statuses `open → in_review → resolved|dismissed`; actions per case: dismiss, warn user, unpublish content, suspend N days, ban [admin+]).
- Every staff action writes to `auditLogs` via Functions (never client-side).
- Sanction effects: `warned` → in-app notice; `suspended` → status screen until `suspendedUntil`; `banned` → permanent status screen; all enforced by security rules on `users.status`.

### F9 — Notifications
- In-app center `/app/notifications` (`notifications/{uid}/items`), unread badge in shell.
- FCM web push (permission requested AFTER first meaningful action, not on load). Tokens are stored as private per-device documents under `users/{uid}/devices/{deviceId}` and pruned by Function on invalid-token errors.
- Events → notification (in-app always; push per user settings): request received, request accepted, new message (throttled: max 1 push per match per 5 min), verification decision, photo moderation decision, moderation sanction, admin broadcast.
- All notification content stored as i18n keys + params; rendered in the recipient's locale.

### F10 — Admin Panel
- Route group `/[locale]/admin/**`, guarded by role (moderator+; every page and server action is independently gated by Section 6, never by sidebar visibility alone).
- The panel is a real operations product, not a decorative dashboard. It uses a responsive desktop-first application shell with collapsible navigation, command/search access, queue counters, saved table state, clear loading/empty/error states, and full RTL/LTR parity.
- **Operations dashboard:** total/active/verified/new users, pending verifications, pending photos, open reports, sanctions, requests and matches created over selectable periods; trend comparison; urgent queue cards; recent staff activity; system notices. Metrics must be truthful and traceable—no fake charts or placeholder numbers in production.
- **Users:** debounced search by email/UID/name, filters by role/status/verification/locale/date, pagination, profile and account detail, activity summary, requests/matches/report counts, moderation history, internal staff notes, warning/suspension/ban controls, and reversible unban/reactivate where policy allows. Destructive or high-impact actions require a reason and confirmation. Role assignment is superAdmin-only.
- **Verification queue:** oldest-first triage, status/age filters, secure selfie viewer, profile comparison context, approve/reject reason workflow, keyboard-friendly next-item navigation, and decision history. Selfie URLs never leak into logs or permanent client state.
- **Photo moderation queue:** original photo review through staff-authorized access, user context, approve/reject with reason, multi-photo navigation, duplicate-decision protection, and history. Bulk approval is forbidden in V1; each image receives an intentional decision.
- **Reports & safety cases:** open/in-review/resolved/dismissed queues, severity and age indicators, linked evidence, reporter/target context, ownership by staff member, internal notes, resolution reason, sanctions, content removal/unpublish actions, and immutable audit events. `underage`, credible threats, or immediate safety indicators are visually escalated.
- **Questions & compatibility:** create/edit/preview questions in all three locales, option editing, validation, activation, reordering, and impact warning before deactivating a question that already has answers.
- **Content & localization:** manage the small set of runtime-configurable public/support copy, verification instructions, report reasons/help copy, and locale completeness indicators. Source-controlled legal pages remain deployment-managed unless a later approved CMS decision says otherwise.
- **Configuration:** limits, feature flags, banned-word lists, discovery lists, contact/support settings, maintenance notice, and safe defaults. Changes show old/new values and require confirmation; secrets and credentials are never editable here.
- **Notifications:** compose an in-app broadcast with localized preview, audience filters, dry-run recipient count, scheduling data model (immediate send only in V1 unless separately approved), confirmation, delivery summary, and failure reporting.
- **Plans & entitlements:** view V1 free plan and user entitlement state; no payment controls while subscriptions are disabled. Manual entitlement changes are superAdmin-only and audited.
- **Audit log:** superAdmin-only, immutable, server-written, filterable by actor/action/target/date, with detail drawer and metadata redaction. No edit/delete action exists.
- **Operations health:** read-only release/environment label, deployed version, Functions/queue health signals available to the app, and recent operational failures without exposing secrets. This is not a substitute for provider monitoring.
- **Data export:** privacy-conscious CSV export for explicitly filtered operational tables, staff permission checked server-side, row limit enforced, sensitive columns excluded by default, and every export audited. No unrestricted database dump UI.
- Every table supports pagination, sort, filtering, visible active filters, reset, URL-restorable state where useful, accessible row actions, and consistent empty/error/loading patterns. Bulk actions exist only where explicitly safe and authorized.
- Admin panel is `noindex`, excluded from sitemap, covered by authorization tests, and visually distinct from the member app while sharing the same design tokens.

### F11 — Settings & Account
- `/app/settings`: language, notification preferences, discovery visibility (`visible|hidden`), blocked list, change password, delete account.
- **Delete account:** double confirmation → callable `requestAccountDeletion` → Function: disables auth user, anonymizes profile (displayName → "Deleted member", clears photos/bio/answers), deletes Storage files, closes matches (counterpart sees "member left"), removes tokens/notifications, sets `users.status="deleted"`. Chats retain anonymized message history for the counterpart. Irreversible.

### F12 — Subscriptions (designed, dormant)
- Collections `plans` and `users.entitlements` exist from V1 with a single free plan (`free`) granting the limits in `appConfig.limits`.
- Feature flag `appConfig.featureFlags.subscriptionsEnabled = false`. No payment UI, no provider integration in V1. All limit checks read from entitlements so V2 only adds payment + entitlement updates.

---

## 8. User Journeys (canonical scenarios)

### J1 — New member (happy path)
1. Lands on marketing page `/ar` → "إنشاء حساب".
2. Signs up → verifies email → Profile Builder steps 1–7 → uploads 2 photos (pending).
3. Prompted to verify identity → submits selfie → sees "under review".
4. Browses discovery (read-only CTA state) meanwhile.
5. Moderator approves verification + photos → user notified → full access.

### J2 — Connection to match
1. Omar filters discovery (age 24–30, Türkiye, practicing) → opens Aisha's profile (photos blurred).
2. Sends request with intro message (within limits).
3. Aisha reviews Omar's profile in Received tab → **Accept** → match created; both notified.
4. Chat opens. After a few days, Aisha toggles "Reveal my photos" → Omar can now view her originals; Omar reveals his in return.

### J3 — Decline & re-send protection
Aisha declines Yusuf's request → Yusuf notified neutrally ("request was not accepted") → he cannot re-send to Aisha for 90 days.

### J4 — Report & sanction
Aisha reports harassment from a match message → moderator opens report, reviews flagged messages, issues 7-day suspension → offender sees suspension screen; Aisha's report marked resolved; audit log written; Aisha blocks the user (match auto-closes).

### J5 — Account deletion
Omar deletes his account → all J2 counterparts see "member left" on the closed match; his data anonymized per F11.

### J6 — Staff onboarding
SuperAdmin (owner) assigns `moderator` role to a staff email via Admin → Users → Roles → staff member's next login carries the claim and sees moderation sections.

---

## 9. Routes & Pages

```
/[locale]                     Marketing landing (SEO, ar/en/tr)
/[locale]/about  /privacy  /terms  /contact
/[locale]/auth/(login|register|forgot|verify-email)
/[locale]/onboarding          Profile builder wizard (guarded)
/[locale]/app                 → redirects to /app/discover
/[locale]/app/discover
/[locale]/app/profile/[uid]
/[locale]/app/requests        (tabs: received | sent)
/[locale]/app/matches
/[locale]/app/matches/[id]
/[locale]/app/verification
/[locale]/app/notifications
/[locale]/app/me              Own profile view/edit (reuses builder steps)
/[locale]/app/settings        (+ /blocked)
/[locale]/status              Suspended/banned/deleted screen
/[locale]/admin/dashboard
/[locale]/admin/users  /users/[uid]
/[locale]/admin/verifications  /photos  /reports  /reports/[id]
/[locale]/admin/questions  /content  /config  /notifications
/[locale]/admin/plans  /audit  /health
```
Guards: `proxy.ts` handles locale normalization and early session-presence routing. Authoritative protected layouts/handlers check verified session → email verified → account status → onboarding completion → role (for `/admin`); Firestore/Storage rules and Functions remain the final data/action boundary.

---

## 10. Firestore Data Model

Conventions: all timestamps are Firestore `Timestamp` (converted to ISO strings at the port boundary). `pairKey` = the two uids sorted alphabetically and joined with `_`. Soft enums are exactly the string unions written below — do not add values.

### 10.1 `users/{uid}` — PRIVATE (owner + staff)
```ts
{
  email: string,
  role: "user" | "moderator" | "admin" | "superAdmin",   // mirror of custom claim
  status: "active" | "suspended" | "banned" | "deleted",
  suspendedUntil: Timestamp | null,
  locale: "ar" | "en" | "tr",
  entitlements: { plan: "free", grantedAt: Timestamp },
  settings: {
    pushEnabled: boolean,
    emailEnabled: boolean,
    discoveryFilters: { /* persisted F4 filters, all optional */ }
  },
  counters: { pendingSent: number, sentToday: number, sentTodayDate: string /* YYYY-MM-DD */ },
  createdAt: Timestamp, lastActiveAt: Timestamp
}
```

Subcollection `users/{uid}/devices/{deviceId}` — private owner/server token record:
`{ token: string, platform: "web", enabled: boolean, createdAt, updatedAt, lastUsedAt }`. The document ID is a generated device identifier, not the raw token. Staff UI cannot read token values.

### 10.2 `profiles/{uid}` — member-facing profile, readable only when eligible/visible (plus owner/staff)
```ts
{
  uid: string,
  displayName: string,                 // first name only
  gender: "male" | "female",           // immutable
  birthYear: number, age: number,      // full DOB lives in a private subdoc: profiles/{uid}/private/personal { dob }
  country: string /* ISO-3166 alpha-2 */, city: string,
  nationality: string, languages: string[],
  maritalStatus: "single" | "divorced" | "widowed",
  hasChildren: boolean, childrenCount: number,
  education: "high_school" | "diploma" | "bachelor" | "master" | "phd" | "other",
  occupation: string, heightCm: number | null,
  smoking: "no" | "occasionally" | "yes",
  religion: {
    practiceLevel: "practicing" | "moderate" | "learning",
    prayer: "always" | "mostly" | "sometimes" | "rarely",
    hijab: "yes" | "no" | "sometimes" | null,     // females only
    sect: string | null, halalLifestyle: boolean
  },
  marriagePlan: {
    timeline: "within_1_year" | "1_2_years" | "flexible",
    relocate: "yes" | "no" | "maybe",
    acceptsChildren: "yes" | "no" | "maybe",
    livingArrangement: string | null
  },
  bio: string, lookingFor: string,
  answers: { [questionId: string]: string | string[] | number },
  photos: {
    [photoId: string]: {
      order: number,
      status: "pending" | "approved" | "rejected",
      rejectReason: string | null,
      blurredPath: string,             // Storage path of blurred variant (set by Function)
      updatedAt: Timestamp
    }
  },
  primaryPhotoId: string | null,
  verification: { status: "unverified" | "pending" | "verified" | "rejected", updatedAt: Timestamp },
  visibility: "visible" | "hidden",
  completionScore: number,
  createdAt: Timestamp, updatedAt: Timestamp, lastActiveAt: Timestamp
}
```

### 10.3 `verificationRequests/{id}`
`{ uid, selfiePath, status: "pending"|"approved"|"rejected", reason: enum|null, reviewedBy: uid|null, createdAt, reviewedAt }`

### 10.4 `connectionRequests/{id}`  (id = auto)
`{ pairKey, fromUid, toUid, message, status: "pending"|"accepted"|"declined"|"withdrawn"|"expired", createdAt, respondedAt: Timestamp|null }`

### 10.5 `matches/{pairKey}`
```ts
{
  uids: [string, string],              // sorted
  participants: { [uid]: { displayName, primaryBlurredPath: string|null } },  // denormalized for list rendering
  status: "active" | "closed",
  closedBy: uid | "system" | null, closedReason: "user_closed"|"block"|"deletion"|"sanction"|null,
  photoReveal: { [uid: string]: boolean },
  lastMessageAt: Timestamp | null, lastMessagePreview: string | null,
  unread: { [uid: string]: number },
  requestId: string, createdAt: Timestamp
}
```
Subcollection `matches/{pairKey}/messages/{id}`:
`{ senderUid, text, deleted: boolean, moderation: { flagged: boolean }, createdAt }`

### 10.6 `blocks/{uid}/blocked/{targetUid}` — `{ createdAt }`
### 10.7 `reports/{id}`
`{ reporterUid, targetUid, targetType: "profile"|"message"|"request", matchId?, messageId?, requestId?, reason: enum(F8), details, status: "open"|"in_review"|"resolved"|"dismissed", handledBy: uid|null, resolutionNote: string|null, createdAt, resolvedAt }`
### 10.8 `notifications/{uid}/items/{id}`
`{ type: string, titleKey, bodyKey, params: object, link: string|null, read: boolean, createdAt }`
### 10.9 `questionBank/{id}`
`{ order: number, category: string, type: "single_choice"|"multi_choice"|"scale_1_5", text: {ar,en,tr}, options: [{ value, label: {ar,en,tr} }] | null, active: boolean, updatedAt }`
### 10.10 `appConfig/main` (single doc)
`{ limits: { maxPendingSent: 3, dailySends: 5, maxPhotos: 5 }, featureFlags: { subscriptionsEnabled: false, dailySuggestions: false }, bannedWords: { ar: string[], en: string[], tr: string[] }, verificationInstruction: {ar,en,tr}, discoveryOptions: object, support: { email, responseTimeText: {ar,en,tr} }, maintenance: { enabled, message: {ar,en,tr} }, updatedAt, updatedBy }`
### 10.11 `auditLogs/{id}` — Functions-only writes
`{ actorUid, actorRole, action: string, targetType, targetId, meta: object, createdAt }`
### 10.12 `plans/{id}` — `{ name: {ar,en,tr}, priceMonthly: number|null, limits: object, active: boolean }` (only `free` seeded in V1)

### 10.12A `adminNotes/{id}` — private staff case notes
`{ targetType: "user"|"report", targetId, body, createdBy, createdAt, editedAt:null }`. Create through a staff-authorized Function so the audit event and sanitized text are written atomically. Notes are never visible to members.

### 10.12B `broadcasts/{id}` — admin notification operations
`{ createdBy, audience: object, content: { ar, en, tr }, status: "draft"|"sending"|"completed"|"failed", estimatedRecipients, sentCount, failedCount, createdAt, startedAt, completedAt }`. Sending is admin+ only, idempotent, batched server-side, and audited.

### 10.12C `systemHealth/current` — sanitized read-only operational summary
`{ environment, release, status: "healthy"|"degraded", checks: object, updatedAt }`. Functions-only write; staff-only read; contains no tokens, stack traces, provider secrets, or personal data.

### 10.13 Composite indexes (declare in `firestore.indexes.json`)
1. `profiles`: gender ASC, verification.status ASC, visibility ASC, lastActiveAt DESC
2. `profiles`: gender ASC, verification.status ASC, visibility ASC, country ASC, age ASC
3. `profiles`: gender ASC, verification.status ASC, visibility ASC, createdAt DESC
4. `connectionRequests`: toUid ASC, status ASC, createdAt DESC
5. `connectionRequests`: fromUid ASC, status ASC, createdAt DESC
6. `connectionRequests`: pairKey ASC, createdAt DESC
7. `matches`: uids ARRAY_CONTAINS, status ASC, lastMessageAt DESC
8. `reports`: status ASC, createdAt ASC
9. `verificationRequests`: status ASC, createdAt ASC
Firestore cannot express every combination of multi-select/disjunctive filters without index explosion. The V1 `DiscoveryRepository` must implement and document a deterministic query plan: apply mandatory eligibility constraints and compatible high-selectivity filters in Firestore, then scan successive bounded batches and post-filter remaining facets until a display page is filled or a configured scan/read cap is reached. Never post-filter only the first displayed batch and imply the result set is complete. Cursor state must remain stable, the UI must not show a fake exact count, and read cost/quality are measured with realistic seed data. If the owner finds discovery quality or cost unacceptable at G3, selecting a dedicated search service becomes an explicit architecture decision rather than hidden technical debt.

### 10.14 Storage layout & rules intent
```
/profiles/{uid}/photos/original/{photoId}.webp    # private: NO client read; owner write (pending), Functions read
/profiles/{uid}/photos/blurred/{photoId}.webp     # read: any authenticated active user; write: Functions only
/verification/{uid}/{requestId}.webp              # write: owner (once); read: staff only
```
Original photo access happens exclusively through the `getRevealedPhotoUrls` callable (signed URLs).

---

## 11. Security Rules Contract

The implementation starts from **default deny**. This section defines behavior; the executor writes maintainable Firestore and Storage rule files plus emulator tests. There are no placeholder rules and no “UI-only” restrictions.

### 11.1 Shared authorization predicates
- `signedIn`: verified Firebase auth context exists.
- `isSelf(uid)`: authenticated UID equals `uid`.
- `role`: custom claim, defaulting to `user` when absent; never trust the mirrored Firestore field for authorization.
- `isStaff` / `isAdmin` / `isSuper`: exact role hierarchy from Section 6.
- `isActive`: authenticated user document exists and status is `active`; suspended/banned/deleted users are denied product reads/writes except the minimum status/account-remedy data required by the status screen.
- Rules validate exact allowed/required keys, types, lengths, immutable fields, timestamps, and ownership. Unknown fields are rejected where practical.

### 11.2 Firestore access matrix

| Path | Client read | Client create/update/delete | Server-only boundary |
|---|---|---|---|
| `users/{uid}` | owner; staff according to case need | no create/delete; owner may update only allow-listed preferences/locale fields | bootstrap, role, status, suspension, entitlements, counters |
| `users/{uid}/devices/{deviceId}` | owner only | owner may register/update/delete own strictly shaped device record | token pruning and invalid-token disable |
| `profiles/{uid}` | active members only when profile is eligible/visible; owner; staff | owner may create/update only editable profile fields; immutable/system/moderation/photo-status fields denied | verification, photo moderation paths, computed/canonical system fields |
| `profiles/{uid}/private/{doc}` | owner; authorized staff only when required | owner writes exact private schema; no other member access | deletion/anonymization and exceptional staff operations |
| `verificationRequests/{id}` | owner of request; staff | active owner can create a strictly shaped `pending` request; no client update/delete | decision/reason/reviewer/timestamps |
| `connectionRequests/{id}` | participants; authorized staff | no client writes | send/respond/withdraw/expire, counters, match creation |
| `matches/{pairKey}` | participants; authorized staff for safety case | no client create/update/delete | match creation, reveal flags, unread reset, close state |
| `matches/{pairKey}/messages/{id}` | participants while permitted; staff only through scoped report evidence access | active participant may create exact text-message schema; sender may soft-delete only their own within 15 minutes; no hard delete or moderation-field write | unread/preview updates, moderation flags, sanctions/anonymization |
| `blocks/{uid}/blocked/{targetUid}` | owner only | no client writes | block/unblock and active-match closure |
| `reports/{id}` | reporter may read receipt-safe subset through repository; staff full read | active reporter may create exact `open` report, or use callable if safe field projection cannot be guaranteed; no client update/delete | ownership, assignment, status, resolution, sanctions |
| `notifications/{uid}/items/{id}` | owner only | owner may change only `read`; no create/delete | notification creation/pruning |
| `questionBank/{id}` | authenticated active members see active public projection; staff sees management data | no client writes | admin CRUD/reorder with validation/audit |
| `appConfig/main` | only a sanitized public/member projection; staff management read | no client writes | allow-listed admin update + audit |
| `plans/{id}` | authenticated members see active public plan fields; staff as authorized | no client writes | superAdmin mutations/entitlements |
| `adminNotes/{id}` | staff | no client writes | staff callable create; immutable afterward |
| `broadcasts/{id}` | admin+ | no client writes | create/send/status counts |
| `systemHealth/current` | staff | no client writes | scheduled/internal update |
| `auditLogs/{id}` | superAdmin | no client writes or deletes | immutable Functions-only append |
| every unspecified path | none | none | none until explicitly designed and tested |

If a single document mixes public and secret/admin-only fields that rules cannot safely project, split it into separate public/private documents. Never expose a whole document and rely on UI code to hide fields.

### 11.3 Storage access matrix
- Original profile photos: active owner may create a new object only under their UID with strict content type/size/name constraints; no client can read originals directly, including staff. Moderation and reveal use short-lived server-authorized URLs or server processing. Client overwrite is denied; deletion uses an authorized operation that also updates metadata.
- Blurred photos: Functions-only write. Authenticated active users can read only when the corresponding photo metadata is approved and the profile is eligible; owners/staff get the minimum additional access needed for state/queue UX.
- Verification selfies: owner may create once at the expected request path; no member read; staff obtains short-lived, case-scoped server-authorized access; Functions delete by retention policy.
- Exports/temporary artifacts: server-only objects with short expiry and one authorized requester; never public bucket objects.
- Validate actual bytes/decoding in Functions; client MIME/extension and Storage metadata are not sufficient security checks.

### 11.4 Mandatory emulator test matrix
For every path/action above, test at least: unauthenticated, active owner, active other member, blocked relationship where relevant, suspended user, moderator, admin, superAdmin, malformed/extra fields, immutable-field attempt, and valid/expired time boundary. Add race/idempotency integration tests for send/accept/withdraw, counters, block/close, reveal/revoke, moderation decisions, and deletion. A rule change cannot merge on line coverage alone; each allowed action needs a success test and each prohibited boundary needs an explicit denial test.

---

## 12. Cloud Functions (TypeScript, Node 22)

Use Cloud Functions for Firebase **2nd gen** for new functions. Do not introduce a 1st-gen-only Auth `onCreate` trigger merely for convenience. User bootstrap is an authenticated, idempotent server operation after signup/session establishment; all background events assume at-least-once delivery and must be idempotent.

| # | Function | Trigger | Responsibility |
|---|---|---|---|
| CF1 | `bootstrapUser` | Callable (authenticated; invoked after signup/first session) | Idempotently create `users/{uid}` skeleton, establish default `user` claim when absent, seed `free` entitlement; never overwrite an existing higher role/status |
| CF2 | `setUserRole` | Callable (superAdmin) | Set custom claim + mirror `users.role` + audit log |
| CF3 | `onPhotoUploaded` | Storage finalize (`/profiles/*/photos/original/*`) | Generate blurred variant (sharp), write `blurredPath`, keep photo `pending` |
| CF4 | `moderatePhoto` | Callable (staff) | Approve/reject photo → update `profiles.photos.{id}.status`, notify owner, audit log |
| CF5 | `decideVerification` | Callable (staff) | Approve/reject verification → mirror to `profiles.verification`, notify, audit log |
| CF6 | `sendConnectionRequest` | Callable (verified active member) | In one transaction validate pair/block/gender/verification/cooldown/daily/pending limits, create request, update counters; notify recipient idempotently |
| CF7 | `respondToConnectionRequest` / `withdrawConnectionRequest` | Callable (authorized recipient/sender) | Transactionally enforce current state; on accept create match and update request/counters; on decline/withdraw update state/counters; notify idempotently |
| CF8 | `onMessageCreated` | Firestore onCreate messages | Update match `lastMessageAt/preview/unread`, banned-word re-check → flag, throttled FCM push to recipient |
| CF9 | `getRevealedPhotoUrls` | Callable | Validate match membership + reveal flag → return 15-min signed URLs for originals |
| CF10 | `blockUser` / `unblockUser` | Callable (active member) | Validate target, atomically create/remove block; blocking closes any active match (`closedReason:"block"`); audit privacy-safe abuse telemetry only |
| CF11 | `applySanction` | Callable (staff; ban requires admin+) | warn/suspend/ban → update `users.status`, close active matches on ban, notify, audit log |
| CF12 | `requestAccountDeletion` | Callable (owner) | Full anonymization pipeline per F11 + audit log |
| CF13 | `onReportCreated` | Firestore onCreate | Notify staff (in-app) |
| CF14 | `scheduledMaintenance` | Scheduler (daily 03:00 UTC) | Expire stale requests (>14d), reset `sentToday` counters, delete verification selfies >90d after decision, prune invalid FCM tokens |
| CF15 | `notify` (internal util) | — | Shared helper: write in-app notification + send FCM respecting user settings & locale |
| CF16 | `updateAdminConfig` | Callable (admin+) | Validate and update approved runtime config fields, write old/new audit metadata with sensitive-value redaction |
| CF17 | `sendBroadcast` | Callable/task queue (admin+) | Validate localized content and audience, calculate dry-run count, fan out idempotently in batches, store summary, audit |
| CF18 | `exportAdminTable` | Callable (role by dataset) | Re-run approved filters server-side, enforce row/column limits, generate short-lived CSV, audit requester and filter scope |
| CF19 | `addAdminNote` | Callable (staff) | Sanitize and create immutable internal user/report note plus audit event atomically |
| CF20 | `refreshSystemHealth` | Scheduled/internal | Write a sanitized staff-visible health summary and release metadata without secrets |
| CF21 | `updateMatchState` | Callable (match participant) | Set/revoke caller's reveal flag, clear caller's unread count, or close match; validate membership/current status and update only caller-authorized state |
| CF22 | `resolveReport` | Callable (staff) | Claim/update/resolve/dismiss a safety case, apply authorized content action/sanction through shared services, notify as appropriate, audit atomically |
| CF23 | `reorderProfilePhotos` / `deleteProfilePhoto` | Callable (owner) | Validate ownership and approved IDs, update canonical order or delete original/blurred objects + metadata idempotently; never let owner alter moderation state |

All Functions validate input with zod, are idempotent where triggered (guard with status checks), and never trust client-provided role/status.

---

## 13. i18n & RTL Requirements
- Locales: `ar` (default), `en`, `tr`. URL prefix always present (`/ar`, `/en`, `/tr`).
- `ar` renders `dir="rtl"`; use CSS logical properties everywhere (`ms-`, `me-`, `text-start`); never `left/right` utilities except for direction-agnostic cases.
- Message files: `apps/web/messages/{ar,en,tr}.json`. NO hardcoded UI strings in components — enforce via review. Enum labels, question bank, notifications, and emails all localized.
- Numbers/dates via `Intl` with the active locale (Western digits in all locales for consistency).
- Fonts: **IBM Plex Sans Arabic** for `ar`, **Inter** for `en`/`tr` (both via `next/font`, self-hosted).

## 14. Product Design & UX System (mandatory, not decorative)

### 14.1 Experience promise
Nisfi must feel like a premium, private, serious introduction service—not a reskinned dating template. The emotional qualities are **trust, dignity, calm, intentionality, privacy, and hope**. Every screen must answer three questions without confusion: where am I, what can I safely do, and what happens next?

Prohibited visual shortcuts: pink dating palettes, hearts/flames as primary motifs, swipe cards, neon gradients, glassmorphism everywhere, generic stock couples, excessive blobs, random decorative icons, fake testimonials/metrics, template-like hero sections, and animation that competes with reading.

### 14.2 Visual concept and owner approval
Before the product UI is built, the executor presents **two polished design directions** on the real localized landing + one member surface + one admin surface. Each direction must include palette, typography, spacing, cards, buttons, photo privacy treatment, icon style, and a short rationale. The owner selects or combines one. The approved direction is recorded in `docs/DESIGN_SYSTEM.md`; after approval it becomes binding.

Working direction until that gate:

| Token role | Working value | Intent |
|---|---:|---|
| Primary 700 | `#0A4D3C` | deep emerald; authority and privacy |
| Primary 600 | `#0E6650` | main interactive color |
| Primary 50 | `#EDF7F3` | calm tinted surfaces |
| Accent 500 | `#C49A55` | restrained antique gold; highlights only |
| Sand 100 | `#EFE6D7` | warm supporting surface |
| Canvas | `#FBFAF7` | warm off-white, less clinical than pure white |
| Surface | `#FFFFFF` | primary cards and panels |
| Ink 950 | `#17201D` | primary text |
| Ink 600 | `#5D6964` | secondary text |
| Border | `#DDE4E0` | quiet separation |

Semantic colors are separate tokens and must pass contrast: success emerald, warning amber, danger red, info blue. Gold is never used for long text or low-contrast controls. The design must remain excellent without gradients; any final gradient is subtle, purposeful, and tokenized.

### 14.3 Typography and iconography
- Arabic is the default design case, not a later translation. Use a high-quality Arabic UI family with excellent numerals and weight range; the working stack remains **IBM Plex Sans Arabic** for Arabic and **Inter** for English/Turkish. A display face may be proposed during the design gate but cannot reduce Arabic readability or add network-dependent font loading.
- Define display, H1–H4, title, body, label, caption, and numeric metric styles as tokens with mobile/desktop scales. Body line-height is generous; dense admin tables use a separate compact scale.
- Icons come from one coherent outline family. Icon-only buttons always have accessible names and tooltips on desktop. Avoid mixing emoji, filled icons, and unrelated sets.

### 14.4 Layout, density, and responsive behavior
- Base grid: 4px; spacing tokens: 4/8/12/16/24/32/48/64/96. Common controls use consistent heights; borders, radii, and shadows are tokenized.
- Marketing max content width: approximately 1200–1280px. Member reading/profile width is deliberately narrower. Admin tables may use the full workspace with sticky headers and responsive detail drawers.
- Member app is mobile-first: comfortable thumb targets (minimum 44×44px), bottom navigation for primary mobile destinations, and a refined sidebar/topbar pattern on larger screens. No essential action depends on hover.
- Admin is desktop-first but remains operational on tablet and provides safe read/triage access on mobile. Wide tables convert to prioritized columns + row detail; they never cause unusable horizontal layouts.
- RTL is visually designed: navigation order, breadcrumb direction, chevrons, drawers, progress steps, charts, table alignment, and mixed Arabic/Latin content are tested—not merely `dir="rtl"`.

### 14.5 Component language
- Surfaces use warm canvas, crisp white panels, restrained elevation, subtle borders, and purposeful 12–20px radii. Avoid turning every text group into a card.
- Primary button: one obvious action per region. Secondary, tertiary, danger, icon, loading, disabled, and confirmation states are defined. Disabled state must explain how to proceed when the reason is not obvious.
- Forms use persistent labels, help/error text, clear required/optional markers, correct autocomplete/input modes, password affordances, and a summary/focus strategy on validation failure.
- Feedback system includes toast for non-critical confirmation, inline state for recoverable issues, banner for account-wide issues, and dialog only for consequential confirmation. No generic “Something went wrong” when a safe actionable message is possible.
- Skeletons resemble final layouts. Empty states explain why the area is empty and offer one relevant next action. Error and offline states preserve user input wherever possible.
- Data tables share filtering, sorting, pagination, column visibility, row action, selection, export, loading, empty, and error behaviors. Destructive bulk actions are not a default capability.

### 14.6 Signature Nisfi experiences
- **Landing:** a distinctive, editorial hero focused on serious intent and privacy; product proof through blurred-photo/reveal and verification storytelling; “how it works”; safety principles; multilingual trust copy; FAQ; final CTA. Use original abstract/geometric brand art or tasteful product UI composition—not a generic romantic photograph.
- **Authentication:** quiet, focused, low-friction layout with clear trust/legal context, password guidance, and preserved locale. Never overload it with marketing content.
- **Onboarding:** resumable stepper with clear progress, one cognitive theme per step, save state, back/next consistency, contextual privacy explanations, and a final review. Long option groups use excellent mobile selection patterns rather than tiny radio grids.
- **Discovery:** deliberate profile browsing, not swiping. Cards prioritize meaningful compatibility signals, accessibility, and privacy. Filters open in a responsive drawer/sheet, show active chips, results count/loading state, clear-all, and sensible defaults.
- **Profile:** structured narrative with clear hierarchy, compatible values, marriage plan, and contextual connection CTA. Sensitive data is never visually overexposed. The request composer explains message expectations and remaining limits.
- **Photo privacy:** the blurred treatment must feel intentional and premium: strong non-reversible blur/downscale, subtle protected overlay, lock/shield mark, plain-language explanation, and an unmistakable reveal state. Do not rely on CSS blur of an original asset.
- **Requests:** received/sent separation, lifecycle/status timeline, expiry/cooldown language, safe confirmation, and clear next steps. Decline never pressures the recipient to justify themselves publicly.
- **Matches/chat:** calm conversation UI with strong identity context, visible safety controls without alarmist styling, thoughtful empty state, resilient message composer, and explicit photo reveal ownership. It must not imitate noisy social messengers.
- **Safety flows:** block/report/sanction interfaces use plain language, prevent accidental actions, preserve evidence, clarify confidentiality, and acknowledge completion.
- **Admin:** premium operations console with higher information density, queue-first navigation, visible permissions, consistent case detail drawers, evidence panes, audit context, and keyboard-efficient triage. It must still feel like Nisfi, not a default shadcn dashboard.

### 14.7 Motion and interaction quality
- Motion communicates continuity and status: 120–180ms micro-interactions, 180–260ms panel/page transitions, restrained easing, no springy dating-app behavior.
- Respect `prefers-reduced-motion`. Do not animate large blurred images or create parallax that harms performance.
- Focus, hover, pressed, loading, success, error, disabled, selected, and drag/reorder states are designed and verified for every interactive component used.

### 14.8 Accessibility, content, and trust UX
- Target WCAG 2.2 AA behavior: contrast, focus visibility, logical keyboard order, screen-reader naming, headings, landmarks, error association, status announcements, and zoom/reflow.
- Copy is respectful, concise, culturally aware, and non-judgmental across marital status, children, religiosity, and rejection. Avoid manipulative urgency, shame, “perfect match,” and unsupported safety promises.
- Privacy explanations appear at the moment of need: who can see a field, why it is requested, retention where relevant, and how to change/delete it.
- Locale QA includes native-quality Arabic/Turkish phrasing, truncation, pluralization, dates, numbers, mixed-direction emails/UIDs, and long-string stress tests.

### 14.9 Design QA gate for every user-facing work unit
The executor must render and inspect the implemented surface at representative mobile and desktop widths in Arabic RTL and at least one LTR locale. The work-unit report covers: visual hierarchy, responsive behavior, keyboard/focus, empty/loading/error/disabled states, translation completeness, overflow, console errors, and screenshot or preview evidence when the environment supports it. A technically working but visibly generic, inconsistent, or unfinished surface does **not** pass.

## 15. Non-Functional Requirements
- **Performance:** marketing pages statically rendered where valid; app/admin code-split; images via `next/image`; Lighthouse ≥ 90 (marketing) / ≥ 80 (app/admin representative routes) on mobile. Phase 0 establishes route-level JavaScript/image budgets and prevents accidental regressions.
- **SEO:** marketing pages only (localized metadata, hreflang, sitemap, OG images). Everything under `/app` and `/admin` is `noindex`.
- **Accessibility:** WCAG 2.2 AA target—keyboard navigation, visible focus, semantic structure, labels/descriptions, contrast, reflow/zoom, reduced motion, status announcements, and automated + manual checks.
- **Privacy/KVKK-GDPR:** explicit and versioned consent where legally required, data minimization, private DOB, data retention matrix, access/correction/deletion workflow, and no non-essential analytics before applicable consent. Religion/practice and verification media are sensitive and require qualified legal review; this specification is not legal approval.
- **Security:** lightweight threat model before sensitive features; least privilege; App Check; email/session verification; server-side rate/limit checks; secure headers and CSP; strict upload type/size/content validation; dependency and secret scanning; redacted logs; no public originals/selfies; authorization/rules regression tests.
- **Reliability:** idempotent triggers/callables, transaction-safe counters, retry-aware jobs, explicit timeouts, failure states, emulator integration tests, rollback/runbook, and verified backup/restore policy before production launch.
- **Observability:** structured redacted logs, release/environment identifiers, error monitoring with no sensitive payloads, actionable operational alerts, and staff-visible sanitized health—not personal data in analytics.
- **Cost control:** Firebase/Vercel budgets and alerts, query/read amplification review, bounded exports/broadcasts, image processing limits, function concurrency/max-instance choices, and a staging-vs-production resource plan before paid services are enabled.
- **Browser/device support:** current major Chrome/Edge/Firefox and Safari versions supported by Next.js 16; representative iPhone/Android mobile widths; graceful explanation for unsupported critical capabilities such as web push.
- **Quality gates:** TypeScript strict with zero `any` in `core/**`; ESLint + Prettier; unit tests for domain/use cases and shared zod schemas; integration tests for repositories/Functions; Firestore/Storage rules emulator tests; targeted end-to-end journeys; CI script `pnpm check` (lint + typecheck + unit/integration as configured) plus build must pass at every phase gate.

---

## 16. Interactive Phased Delivery Plan

### 16.1 Non-negotiable cadence
Only one work unit below is implemented at a time. For each unit the agent follows this loop:

1. **Orient:** inspect current `main`, relevant files, existing decisions, and dirty changes. State the unit goal, files likely affected, acceptance checks, and any one blocking question.
2. **Implement:** change only the approved unit. Do not quietly begin adjacent units.
3. **Verify:** run proportionate automated checks plus visual/interaction QA for UI work. Fix failures caused by the unit.
4. **Show:** summarize the exact result, provide preview/screenshots when available, list tests run, and call out real limitations or decisions.
5. **Stop:** wait for the owner to say approve, revise, or reject. Silence is not approval.
6. **Record:** after approval, update `docs/PHASE_STATUS.md` and any approved decision. A small scoped local commit may be created if the environment supports it, but nothing is pushed until the phase gate.

The owner may request several tiny related corrections within the active unit; those are revisions, not a new unit. If a correction expands scope materially, the agent explains that and requests approval.

### Phase 0 — Product foundation and approved design language

| Unit | Deliverable | Unit acceptance |
|---|---|---|
| 0.0 | Repository preflight, architecture confirmation, Node/pnpm policy, baseline docs (`README`, `DECISIONS`, `PHASE_STATUS`, env example) | Empty/current repo truth is documented; no secrets; owner understands planned foundation |
| 0.1 | pnpm monorepo scaffold: `apps/web`, `functions`, `packages/shared`; strict TS, lint/format/test scripts | clean install; `pnpm check` passes on scaffold |
| 0.2 | next-intl locale routing and semantic RTL/LTR base; minimal route shell | `/ar`, `/en`, `/tr` render correctly; Arabic direction and locale switching verified |
| 0.3 | two high-fidelity visual directions using real Nisfi content on landing/member/admin sample surfaces | owner selects or combines a direction; no generic template accepted |
| 0.4 | approved design tokens, primitives, member shell, admin shell, responsive navigation, state patterns, `docs/DESIGN_SYSTEM.md` | mobile/desktop + RTL/LTR visual gate passes |
| 0.5 | Firebase adapters/ports boundary, emulator config, App Check/env wiring, CI, restricted-import lint rule | emulators start; no Firebase import outside infrastructure; CI/local checks green |

**Gate G0:** all Phase 0 unit evidence is current; `pnpm check` passes; design system is owner-approved; emulators run; diff is reviewed. After explicit owner approval: update phase status, commit intentionally, push to `origin/main`, verify remote/CI, then stop.

### Phase 1 — Public experience and authentication

| Unit | Deliverable | Unit acceptance |
|---|---|---|
| 1.1 | Premium localized landing page and shared public navigation/footer | mobile/desktop, RTL/LTR, SEO structure, no fake content |
| 1.2 | About/contact/FAQ and legal-page shells with clear draft/legal-review labeling | localized routes, accessibility, no invented legal assurances |
| 1.3 | Register/login/forgot-password UI and validation | field/error/loading flows work in three locales |
| 1.4 | Firebase auth integration, email verification, session/route guard strategy, first-login routing | emulator end-to-end auth path and authorization tests pass |

**Gate G1:** public/auth journey passes in emulators and browsers; owner approves visual quality; full checks green; approved push-to-`main` closure as defined in G0.

### Phase 2 — Profile, onboarding, photos, and identity verification

| Unit | Deliverable | Unit acceptance |
|---|---|---|
| 2.1 | Domain schemas, profile repository, security rules/tests for private/public profile split | boundary and rules tests cover owner/other/staff/unauthorized cases |
| 2.2 | Onboarding steps 1–3 with resumable saving | validation, back/resume, mobile RTL UX pass |
| 2.3 | Onboarding steps 4–6 and admin-driven compatibility questions | dynamic localized questions and completion logic tested |
| 2.4 | Photo upload/reorder/delete, processing pipeline, moderation states | limits/type/size, original privacy, server-generated blur verified |
| 2.5 | Verification submission and user status experience | private selfie path/rules and retry/rejection UX verified |
| 2.6 | Own profile review/edit and completion gates | completion calculation and app guard pass end-to-end |

**Gate G2:** canonical J1 through verification submission passes; moderator decision can be exercised by controlled test tooling; security/rules tests and design QA pass; approved push-to-`main` closure.

### Phase 3 — Discovery and intentional connection requests

| Unit | Deliverable | Unit acceptance |
|---|---|---|
| 3.1 | Discovery query model, indexes, exclusion/block strategy, repository tests | pagination and exclusion logic demonstrated with seeded users |
| 3.2 | Discovery cards, filters, responsive filter sheet, saved filter state | no swipe mechanics; mobile RTL/LTR and empty/error states pass |
| 3.3 | Profile detail and privacy-preserving media presentation | only public data and blurred assets are reachable |
| 3.4 | Send/request composer, limits, dedupe, cooldown, server enforcement | race/duplicate/daily/pending limit tests pass |
| 3.5 | Received/sent request center; accept/decline/withdraw/expire | transitions and permissions tested with two users |
| 3.6 | Blocking foundation and in-app notifications | block removes both directions and closes/prevents applicable interaction |

**Gate G3:** J2 steps 1–3 and J3 pass with realistic seeded accounts; rules, indexes, counters, notifications, and visual states pass; approved push-to-`main` closure.

### Phase 4 — Matches, chat, photo reveal, and push

| Unit | Deliverable | Unit acceptance |
|---|---|---|
| 4.1 | Accepted-request transaction and match list | clients cannot create matches; idempotency and pair membership tested |
| 4.2 | Real-time text chat, unread behavior, message moderation metadata | send/list/unread and authorization tests pass |
| 4.3 | Soft delete window, close-match flow, robust conversation states | timing and ownership checks pass server-side |
| 4.4 | Independent photo reveal controls and short-lived original access | revocation and unauthorized URL requests fail; originals never public |
| 4.5 | FCM permission education, token lifecycle, throttled message push | permission timing, invalid-token handling, throttle evidence |

**Gate G4:** full J2 including chat/reveal passes; privacy attack cases are tested; owner approves member UX; approved push-to-`main` closure.

### Phase 5 — Safety and moderation operations

| Unit | Deliverable | Unit acceptance |
|---|---|---|
| 5.1 | Report flows from profile/request/message and evidence capture | reporter privacy, validation, dedupe/abuse considerations tested |
| 5.2 | Admin shell authorization, dashboard truth metrics, queue counters | role matrix and noindex behavior tested; no placeholder production data |
| 5.3 | Verification moderation queue | secure viewer, decision reasons, audit and notification pass |
| 5.4 | Photo moderation queue | intentional single-photo decisions, duplicate-action defense, audit pass |
| 5.5 | Report case workspace, internal notes, warn/suspend/ban/unban | J4 passes; high-impact actions require reason/confirmation |
| 5.6 | User operations and role assignment | search/filter/detail and superAdmin-only role changes tested |

**Gate G5:** J4 and role/queue scenarios pass; every staff mutation has an immutable audit event; suspended/banned members are locked out by rules/server checks; approved push-to-`main` closure.

### Phase 6 — Complete control panel

| Unit | Deliverable | Unit acceptance |
|---|---|---|
| 6.1 | Compatibility question management with localized preview/reorder | validation and existing-answer impact warning pass |
| 6.2 | Runtime content/localization completeness and app configuration | allow-listed config only; old/new audit; unsafe values rejected |
| 6.3 | Broadcast composer, audience dry run, batched server sending, summary | authorization, idempotency, localization and failure path tested |
| 6.4 | Plans/entitlements read model and controlled manual management | subscription flag stays off; superAdmin mutations audited |
| 6.5 | Audit explorer, privacy-safe exports, operational health view | immutable log, permissions, export limits/redaction, no secrets |
| 6.6 | Admin responsiveness, keyboard triage, table/state consistency, performance polish | tablet/mobile safe access, desktop efficiency, RTL/LTR design QA pass |

**Gate G6:** all F10 modules are operational within approved V1 scope; J6 passes; role matrix regression suite and owner control-panel walkthrough pass; approved push-to-`main` closure.

### Phase 7 — Settings, privacy rights, hardening, and launch

| Unit | Deliverable | Unit acceptance |
|---|---|---|
| 7.1 | Member settings: locale, notifications, visibility, blocked users, password | permissions and reversible preferences pass |
| 7.2 | Account deletion/anonymization pipeline and retained-chat behavior | J5 and idempotent failure/retry tests pass; Storage cleanup verified |
| 7.3 | Seed tooling for questions/config/free plan and safe environment labeling | repeatable, idempotent, environment-confirmed; never seeds prod accidentally |
| 7.4 | Full accessibility, localization, responsive, empty/error/offline, and security review | documented defects fixed or explicitly accepted |
| 7.5 | Performance/SEO/analytics/privacy review | targets in Section 15 met; only approved events/trackers |
| 7.6 | Staging deployment and owner acceptance walkthrough | J1–J6 pass against staging; deployment/runbook complete |
| 7.7 | Production launch checklist and controlled deployment | backups/rollback/monitoring/domain/legal approvals confirmed before action |

**Gate G7 (launch gate):** complete automated suite passes; staging evidence and owner sign-off exist; legal/brand/environment blockers are resolved; production deployment requires a separate explicit confirmation. Push and deployment are different approvals.

---

## 17. Constraints for Interactive AI Execution (HARD RULES)

### 17.1 Conversation and scope discipline
1. This document is the baseline. The owner's newest explicit instruction overrides it; the agent records any lasting override in the spec/decisions instead of letting documentation drift.
2. Work on exactly one approved unit. Never respond to a unit request with an enormous unreviewable implementation spanning future units.
3. Begin with the outcome and current unit, not a lecture. Ask only when the missing answer materially changes behavior, security, architecture, cost, or visual direction.
4. If unsure, say what is known, what is unclear, the recommended choice, and the consequence. Do not improvise a hidden workaround or “glue” mismatched code together.
5. Never claim a screen, test, deploy, commit, or push succeeded without evidence from the actual environment.

### 17.2 Engineering integrity
6. Inspect before editing. Preserve user changes and unrelated files. Do not rewrite working areas merely for stylistic preference.
7. Prefer coherent domain/port/infrastructure implementations over page-local Firebase calls, duplicated logic, mocks presented as production, or TODO-filled shells.
8. Do not change architecture, scope, names, roles, data model, enums, limits, dependencies, or security posture silently. Propose → owner approves → update documentation → implement.
9. No dependency is added only to save a few lines. For each material dependency, verify maintenance/compatibility/license, explain why existing stack is insufficient, and record the approved decision.
10. Never print, log, commit, or hardcode credentials, `.env` values, Firebase private keys, VAPID secrets, service accounts, signed URLs, or personal verification media. Use validated environment variables and redacted diagnostics.
11. No Conda/Anaconda. Use the repository-declared Node and pnpm versions. Lockfile changes must be intentional.
12. All user-facing strings—including errors, dialogs, emails/templates under project control, admin copy, empty states, and toasts—use localization keys for `ar`, `en`, and `tr`.
13. Client code can never create matches, change role/status/entitlements, approve moderation, forge counters, write audit events, or read original/selfie media directly. UI hiding is never authorization.
14. “Functions-only” paths are denied to clients by Firestore/Storage rules and covered by emulator tests. Sensitive actions re-check auth, role, account status, inputs, ownership, rate/limit state, and idempotency server-side.
15. Do not use production data or production mutation to test a work unit. Use emulators/dev/staging and clearly label the active environment.

### 17.3 UI/UX quality bar
16. Do not accept default framework/shadcn appearance as the design. Components are adapted to the approved Nisfi tokens, density, content, RTL behavior, and interaction states.
17. Every visible surface is finished for real content plus loading, empty, error, disabled, success, long-text, and permission-restricted states relevant to it.
18. Visual QA is mandatory at representative mobile/desktop widths, Arabic RTL and an LTR locale. Check overflow, focus, contrast, keyboard, touch targets, reduced motion, console/network errors, and perceived quality.
19. No fake statistics, reviews, user photos, safety claims, or operational success states ship as if real. Clearly labeled development fixtures are allowed only outside production.
20. When a visual result is subjective, show a small number of strong, meaningfully different options and ask the owner; do not produce many shallow variants.

### 17.4 Git, `main`, and phase closure
21. The intended integration branch is `main`. Direct-to-main work does not remove the need for unit review, clean checks, and explicit owner approval.
22. Do not push after every small revision. At the phase gate: inspect status/diff, preserve unrelated changes, synchronize safely with `origin/main`, run the full phase check, update docs, show the closure summary, and request the exact push approval.
23. After the owner approves the push, stage explicit files, create an intentional phase commit (or preserve approved scoped unit commits), push `main`, then verify remote branch/CI and report the commit SHA. Never force-push or rewrite shared history.
24. If remote `main` moved or a conflict appears, stop, explain the exact conflict, and resolve with the owner rather than overwriting remote work.
25. Deployment is not implied by push. Vercel/Firebase staging or production actions occur only in their approved deployment unit; production always requires explicit confirmation.

### 17.5 Required unit handoff format
At the end of every work unit, the response contains only what helps the owner decide:

- completed outcome and where to preview it;
- exact checks and their results;
- key files/areas changed (not a noisy dump);
- any decision, limitation, or risk that remains;
- one clear prompt: **approve this unit, request changes, or reject it**.

At phase closure, also include gate evidence, commit plan, and the exact `main` push/deploy boundary. Update `docs/PHASE_STATUS.md`; do not produce parallel status documents that drift.

## 18. Central Constants (`packages/shared/src/constants.ts`)
```ts
export const APP_NAME = "Nisfi";
export const APP_NAME_AR = "نِصفي";
export const SUPPORTED_LOCALES = ["ar", "en", "tr"] as const;
export const DEFAULT_LOCALE = "ar";
export const LIMITS_FALLBACK = { maxPendingSent: 3, dailySends: 5, maxPhotos: 5 };
export const REQUEST_MESSAGE = { min: 50, max: 300 };
export const CHAT_MESSAGE = { min: 1, max: 1000 };
export const MIN_AGE = 18;
export const REQUEST_EXPIRY_DAYS = 14;
export const DECLINE_COOLDOWN_DAYS = 90;
export const MESSAGE_DELETE_WINDOW_MIN = 15;
```
Runtime-tunable values load from `appConfig/main` with these as fallbacks.

## 19. Owner Decisions and External Inputs

These items do not block earlier unrelated units. The executor asks for each only when its “needed by” boundary approaches.

| Item | Needed by | Rule |
|---|---|---|
| Approved visual direction, logo/wordmark status, and whether a temporary text mark is acceptable | Unit 0.3–0.4 | executor proposes strong options; owner chooses; do not invent a final logo silently |
| Firebase dev/staging/prod project IDs, web config, VAPID and server credentials | Unit 0.5 for real wiring; emulators can begin earlier | values go only into approved secret/env channels, never committed or repeated in docs/chat |
| Firebase/Functions billing plan, budget alerts, and acceptable monthly guardrails | before any paid staging resource/function deployment | show expected cost drivers; never enable billing or deploy paid resources by implication |
| Firestore/Storage/Functions primary region and data-residency choice | before permanent Firebase provisioning in 0.5 | recommend based on Türkiye/Europe/MENA latency and legal review; record the irreversible/expensive aspects |
| Domain and DNS (`nisfi.app` or approved alternative) plus trademark/name review | before Unit 7.5–7.7 | do not build launch metadata around an unconfirmed domain |
| Qualified Terms, Privacy, consent, retention, sensitive-data and moderation policy review for KVKK/GDPR/target markets | draft shells in 1.2; approval before staging acceptance/launch | AI drafts remain visibly unapproved until reviewed |
| Initial moderator/admin/superAdmin identities and secure bootstrap procedure | before Unit 5.2/5.6 | never hardcode staff emails or grant roles client-side |
| Starter compatibility questions (executor drafts 10 × 3 locales) | review in 2.3; final seed in 7.3 | owner approves wording, cultural fit, answer types, and ordering |
| Support/contact channels and response expectations | before 1.2/config seed | public promises must match real operations |
| Analytics/error-monitoring consent and provider choice | before Unit 7.5 | no new tracker or sensitive event payload without approval |

## 20. Starting or Resuming a Coding Session

When this file is attached to a new Codex/agent session with repository access, the owner's kickoff may be:

> Read `NISFI_MASTER_SPEC.md` fully and inspect the current `main` branch. Do not implement future units. Start only with the next incomplete work unit from Section 16. First give me its goal, current repository truth, proposed acceptance checks, and at most one genuinely blocking question. Then wait for my approval before editing. After implementation, test it, show me the result, and stop so we can approve or revise it. Do not push until the phase gate and my explicit approval.

On resume, `docs/PHASE_STATUS.md`, `docs/DECISIONS.md`, the actual repository/tests, and the owner's newest instruction determine the next incomplete unit. Never rely on conversational memory alone when repository evidence exists.

— END OF SPECIFICATION —
