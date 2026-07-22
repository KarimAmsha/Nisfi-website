# Nisfi — Security Notes & Lightweight Threat Model

Living security record for the platform. Aligned with `NISFI_MASTER_SPEC.md`
(«Security», Sections 11–12) and the owner directives (O-001 secrets/wiring
deferred to a single final step; O-002 images on Cloudinary). This is not a
substitute for a full pen-test before launch.

## Core security posture

- **Authorization is server-side, never the UI.** Firestore security rules and
  Cloud Functions are the enforcement boundary (A-008). Client gates
  (`AuthGate`, role-filtered nav, the `/status` redirect) are UX only and are
  documented as such wherever they appear.
- **Default-deny data model.** `firestore.rules` starts from deny-all; every
  collection opens the minimum needed. Sensitive collections
  (`connectionRequests`, `matches`, `reports` transitions, `verificationRequests`
  decisions, `auditLogs`, `systemHealth`, `broadcasts`, `plans`, `appConfig`,
  `questionBank`, `users.role`/`status`/`entitlements`) are **server-only to
  write**; the deciding logic lives in `@nisfi/shared` so client preflight and
  server enforcement can never drift.
- **Account-status lockout.** `isActive()` denies all product reads/writes to
  `suspended` / `banned` / `deleted` members; the client mirrors this by routing
  them to `/status` (Unit 7.3). Deletion anonymizes and is irreversible (7.2).

## Threat model (STRIDE-lite)

| Threat | Vector | Mitigation |
|---|---|---|
| **Spoofing** | Forged identity / role | Firebase Auth; roles from **custom claims** (not the mirrored Firestore field); App Check attests the app; email verification gate. |
| **Tampering** | Client writes to protected data | Default-deny rules; server-only writes for all sensitive collections; exact-shape create rules; owner field allow-lists. |
| **Repudiation** | "I didn't do that" | Immutable, superAdmin-only `auditLogs`; every staff mutation appends an audited old→new event (Cloud Functions). |
| **Information disclosure** | Leaking PII / originals / secrets | Photo originals never public — Cloudinary private + short-lived signed reveal (O-002); audit metadata redacted; exports exclude sensitive columns + are row-bounded; health summary sanitized; strict CSP + `Referrer-Policy`. |
| **Denial of service / abuse** | Spam requests, mass sends | Server-side rate/limit checks (pending/daily connection-request limits, decline cooldown), bounded exports/broadcasts, idempotent broadcast dispatch, image size/type limits, planned Function concurrency/max-instance caps. |
| **Elevation of privilege** | User → staff / self-sanction | Role changes are **superAdmin-only** and never self; sanctions role-gated (ban = admin+); staff cannot act on equal/greater-rank peers; entitlement grants superAdmin-only while subscriptions stay off. |

## Hardening checklist

| Area | Status |
|---|---|
| Firestore rules as the authorization boundary (+ emulator regression tests) | ✅ in place, expanded per unit (rules suite green) |
| Secure response headers + strict CSP (`next.config.ts`) | ✅ Unit 7.4 — self-first CSP, `object-src 'none'`, `frame-ancestors 'none'`, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` |
| App Check enforcement point (`ensureAppCheck`, invoked at startup) | ✅ scaffolded + invoked; **inert until a reCAPTCHA site key is provided** (O-001) |
| Upload validation (type/size/count) client-side + server re-validation | ✅ `validatePhotoUpload` (jpeg/png/webp, ≤8 MB, ≤6 photos); server re-validates bytes — never trusts client MIME/size |
| Server-side rate/limit checks on sensitive actions | ✅ connection-request pending/daily limits + cooldown; bounded exports/broadcasts |
| Secret handling | ✅ no secrets in the repo; all real keys/credentials provided at the final production-wiring step (O-001). The previously-leaked service-account key is rotated there. |
| Redacted logs / no PII in analytics | ✅ audit redaction; sanitized health; export column exclusion |

## Deferred to the final production-wiring step (O-001 / O-002)

- Provide the reCAPTCHA App Check **site key** (`NEXT_PUBLIC_...`) and enable App
  Check **enforcement** on Firestore/Functions/Storage-equivalent (Cloudinary).
- Rotate the leaked service-account key; provision all `FIREBASE_*` server
  credentials and Cloudinary keys as environment secrets.
- **CSP tightening:** move `script-src` from `'unsafe-inline'` to per-request
  **nonces** via middleware (accepting the shift to dynamic rendering where
  needed), and add CSP violation reporting.
- Firebase/Vercel budget alerts, Function concurrency/max-instance caps, and a
  staging-vs-production resource plan before paid services are enabled.
- Dependency and secret scanning in CI; a full third-party security review.
