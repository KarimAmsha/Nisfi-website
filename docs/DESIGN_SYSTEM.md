# Nisfi — Design System «وَقار» (Waqār)

> **Binding.** The owner approved Direction A («وَقار») on 2026-07-21 (decision D-001). This document is the binding design record required by `NISFI_MASTER_SPEC.md` Section 14.2. Product UI must follow it; conflicts are resolved by the owner before implementation. The alternative pitch (Direction B «سَكينة») and both previews remain in `docs/design/` for history.

## 1. Concept

Emerald authority with restrained antique gold. Nisfi reads as a serious, private introduction service — trust, dignity, calm, intentionality. Crisp white panels on a warm off-white canvas; gold appears only as a mark/hairline, never as body text.

## 2. Color tokens

Defined as CSS custom properties in `apps/web/src/app/globals.css` (`@theme`), consumed as Tailwind utilities (`bg-primary`, `text-ink`, `border-border`, …).

| Token | Value | Utility | Use |
|---|---|---|---|
| `--color-canvas` | `#FBFAF7` | `bg-canvas` | App/page background |
| `--color-surface` | `#FFFFFF` | `bg-surface` | Cards, panels, bars |
| `--color-primary` / `-600` | `#0E6650` | `bg-primary`, `text-primary` | Main interactive color |
| `--color-primary-700` | `#0A4D3C` | `text-primary-700` | Hover/authority, admin sidebar |
| `--color-primary-50` | `#EDF7F3` | `bg-primary-50` | Calm tinted surfaces, active nav |
| `--color-accent` | `#C49A55` | `text-accent`, `bg-accent` | Gold mark/hairline only |
| `--color-ink` | `#17201D` | `text-ink` | Primary text |
| `--color-ink-600` | `#5D6964` | `text-ink-600` | Secondary text |
| `--color-border` | `#DDE4E0` | `border-border` | Quiet separation |

**Semantic** (separate from the accent, contrast-checked): `--color-success #1F8A5B`, `--color-warning #C9821E`, `--color-danger #B4402F`, `--color-info #2B6CB0`. Gold is never used for long text or low-contrast controls.

## 3. Typography

- **Arabic (default design case):** IBM Plex Sans Arabic. **Latin (en/tr):** Inter. Both self-hosted via `next/font` (wired in Unit 0.2); the font family switches on `html[dir="rtl"]`.
- Scale via Tailwind: display `text-5xl/6xl` bold, headings `text-2xl/lg` bold with `tracking-tight` and `text-balance`, body `text-sm`/base with generous line-height, labels `text-xs uppercase tracking-wider`, numeric columns use `tabular-nums`.

## 4. Spacing, radii, elevation

- 4px base; Tailwind spacing scale. Radii tokens: `--radius-sm 8`, `--radius 11` (buttons), `--radius-md 13`, `--radius-lg 18` (cards), `--radius-xl 24`.
- Elevation: `--shadow-card` (`shadow-card`) — restrained, single soft layer. Avoid turning every text group into a card.

## 5. RTL

Logical properties everywhere (`ms/me`, `ps/pe`, `start/end`, `border-s/e`, `text-start`). Layout is designed for both directions, not merely `dir="rtl"`: the member sidebar and admin queue sit on the inline-start and mirror correctly; the audit accent border uses `border-s`. Verified at desktop RTL, LTR (mirrored), and mobile.

## 6. Components (`apps/web/src/components/ui`)

- **Button** (`button.tsx`) — variants `primary | secondary | ghost | danger`, sizes `sm | md | lg`, `block`, and `loading` (spinner, `aria-busy`, disabled). Focus ring + reduced-motion aware. `buttonVariants` is exported for styling `Link`s.
- **Card** (`card.tsx`) — `Card`, `CardHeader`, `CardTitle`, `CardBody`.
- **Badge** (`badge.tsx`) — status pill tones `neutral | brand | pending | info | success | danger`, optional `dot`.
- **Field** (`input.tsx`) — labelled input with persistent label, optional marker, hint/error text, `aria-invalid`/`aria-describedby`.
- **Skeleton** (`skeleton.tsx`) — loading placeholder that resembles final layout; reduced-motion aware.
- **EmptyState** (`empty-state.tsx`) — icon + reason + one relevant action.
- **Icons** (`icon.tsx`) — one coherent outline family, `currentColor`, accessible-hidden.

## 7. Shells (`apps/web/src/components/shell`)

- **MemberShell** — mobile-first: sticky top bar, desktop inline-start sidebar, mobile bottom navigation (≥44px targets); active route marked `aria-current`.
- **AdminShell** — desktop-first, queue-first emerald sidebar with counts; workspace header + content; collapses to a scrollable top bar on mobile. Feels like Nisfi operations, not a default dashboard.

## 8. States, motion, accessibility

- Every interactive element defines hover/focus/disabled/loading; empty and status states are localized. Feedback favours inline/badge over generic dialogs.
- Motion: 120–180ms micro / 180–260ms panel; `motion-reduce` disables animation.
- WCAG 2.2 AA intent: visible focus ring, semantic landmarks, labelled controls, contrast-checked tokens, logical keyboard order.

## 9. Photo privacy treatment

Protected media is an **intentional treatment** — geometric emerald ground + lock/shield mark + «صورة محمية / Protected photo» and a plain-language reveal line — never a CSS blur of a real photo. Originals/selfies are never publicly readable (enforced server-side in later units).

## 10. Scope note

Unit 0.4 establishes the system, primitives, member/admin shells, responsive navigation, and state patterns, applied to a minimal set of surfaces with sample content. Feature data, auth, Firebase wiring, and full routes arrive in their approved units.
