# Nisfi — Visual Direction Options (Phase 0 / Unit 0.3)

> **Status:** Draft pitch for owner selection. **Not binding.** Per `NISFI_MASTER_SPEC.md` Section 14.2, the owner selects or combines one direction; the approved result is then recorded in `docs/DESIGN_SYSTEM.md` and becomes binding. Until then, no product UI is built on either direction.

Preview both directions in [`visual-directions.html`](./visual-directions.html) — each shows the real landing page, a member surface (discovery with photo-privacy treatment), and an admin surface (verification queue), in Arabic RTL with an English LTR sample.

Both directions honour the mandatory constraints of Section 14: premium, private, serious, Arabic-first, WCAG-minded, and free of prohibited dating-app shortcuts (no pink palettes, hearts/flames, swipe cards, neon gradients, stock couples, or fake metrics). The photo treatment in both is an **intentional protected tile** (geometric ground + shield + "صورة محمية — تُكشف بموافقة الطرفين"), never a CSS blur of a real photo.

---

## Direction A — «وَقار» (Waqār / Dignity)

**Rationale.** Institutional trust. A deep emerald authority with a very restrained antique-gold mark communicates a serious, protected introduction service — closest to the spec's working tokens. Crisp white panels, tight refined radii, confident editorial hierarchy. Gold is a hairline/mark accent only, never body text.

| Token | Value |
|---|---|
| Primary 700 | `#0A4D3C` |
| Primary 600 | `#0E6650` |
| Primary 50 | `#EDF7F3` |
| Accent (gold) | `#C49A55` |
| Canvas | `#FBFAF7` |
| Surface | `#FFFFFF` |
| Ink / Ink-600 | `#17201D` / `#5D6964` |
| Border | `#DDE4E0` |
| Radii | 13–18px (sharp, refined) |
| Buttons | soft-rectangular, 11px |
| Motif | interlocking arcs / mashrabiya line art |

**Feels like:** a trusted institution — authoritative, calm, editorial.

---

## Direction B — «سَكينة» (Sakīna / Serenity)

**Rationale.** Calm and hope. A muted teal-slate with a warm, earthy clay accent, larger radii, and more air. Contemporary and gentle without losing privacy or premium quality. The dawn/horizon motif signals hope; fully-rounded buttons and softer surfaces feel approachable.

| Token | Value |
|---|---|
| Primary 700 | `#173F3B` |
| Primary 600 | `#2C6560` |
| Primary 50 | `#E7F0EE` |
| Accent (clay) | `#B0705B` |
| Canvas | `#F2F4F3` |
| Surface | `#FFFFFF` |
| Ink / Ink-600 | `#182320` / `#64726D` |
| Border | `#E2E8E5` |
| Radii | 20–26px (soft, airy) |
| Buttons | fully rounded (pill) |
| Motif | dawn / horizon arcs |

**Feels like:** a serene, modern, welcoming space — gentle but still private.

---

## Shared foundations (both directions)

- **Typography:** IBM Plex Sans Arabic (Arabic, the default design case) + Inter (English/Turkish), self-hosted via `next/font`. A display face may be proposed at approval but must not reduce Arabic readability or add network font loading. (The HTML preview uses a system stack because Artifact/CSP blocks network fonts; the product uses the self-hosted faces already wired in Unit 0.2.)
- **Semantic colours** (separate from the accent): success `#1F8A5B`, warning `#C9821E`, danger `#B4402F`, info `#2B6CB0`. Gold/clay is never used for long text or low-contrast controls.
- **Spacing/grid:** 4px base; tokens 4/8/12/16/24/32/48/64/96. Tokenised borders, radii, shadows.
- **RTL is designed, not just `dir="rtl"`:** logical properties throughout; navigation order, chevrons, drawers, and table alignment mirror correctly.
- **Motion:** 120–180ms micro-interactions, 180–260ms panel transitions, restrained easing, `prefers-reduced-motion` respected.

## How to choose

Reply with one of:

1. **Direction A (Waqār)** — proceed with emerald + gold institutional.
2. **Direction B (Sakīna)** — proceed with teal-slate + clay serene.
3. **Combine** — e.g. "A's palette with B's softer radii/spacing", or any mix; name the parts.

Optional inputs that sharpen the result: logo/wordmark status (is the text mark «نِصفي» acceptable for now, per decision D-001?), and whether a display face should be explored.

After your selection, Unit 0.4 turns the chosen direction into `docs/DESIGN_SYSTEM.md`, design tokens, primitives, and the member/admin shells.
