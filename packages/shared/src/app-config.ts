import { z } from "zod";
import { type LocalizedText } from "./compatibility";
import { isAdminRole, type Role } from "./role";

/**
 * Runtime app configuration (master spec Section 6.2, F10). A single
 * `appConfig` surface the app reads at runtime: allow-listed feature flags,
 * bounded numeric tunables, and editable localized content blocks. Only these
 * keys exist — writes to unknown keys or out-of-range values are rejected, and
 * every change carries an old→new audit. Config is admin-managed and
 * server-only to write; members read. Defaults below are the fallback when a
 * value is missing, so the app never depends on the document existing.
 */

/** Boolean feature flags (allow-listed). `subscriptionsEnabled` stays off in
 * V1 — there is no paid tier or billing integration (master spec 6.4/10.11). */
export const CONFIG_FLAGS = [
  "signupsEnabled",
  "discoveryEnabled",
  "chatEnabled",
  "subscriptionsEnabled",
] as const;
export type ConfigFlag = (typeof CONFIG_FLAGS)[number];

/** Numeric tunables with inclusive integer bounds. */
export interface LimitSpec {
  min: number;
  max: number;
  default: number;
}
export const CONFIG_LIMITS = {
  maxPendingSent: { min: 1, max: 20, default: 3 },
  dailySends: { min: 1, max: 50, default: 5 },
  declineCooldownDays: { min: 0, max: 365, default: 90 },
} as const satisfies Record<string, LimitSpec>;
export type ConfigLimitKey = keyof typeof CONFIG_LIMITS;

/** Editable localized content blocks the app renders. */
export const CONTENT_BLOCKS = ["announcement", "onboardingIntro"] as const;
export type ContentBlockKey = (typeof CONTENT_BLOCKS)[number];
export const CONTENT_MAX = 600;

export interface AppConfig {
  flags: Record<ConfigFlag, boolean>;
  limits: Record<ConfigLimitKey, number>;
  content: Record<ContentBlockKey, LocalizedText>;
}

const emptyText: LocalizedText = { ar: "", en: "", tr: "" };

/** Fallback config — used when the `appConfig` document (or a key) is missing. */
export const DEFAULT_APP_CONFIG: AppConfig = {
  flags: {
    signupsEnabled: true,
    discoveryEnabled: true,
    chatEnabled: true,
    subscriptionsEnabled: false,
  },
  limits: {
    maxPendingSent: CONFIG_LIMITS.maxPendingSent.default,
    dailySends: CONFIG_LIMITS.dailySends.default,
    declineCooldownDays: CONFIG_LIMITS.declineCooldownDays.default,
  },
  content: {
    announcement: { ...emptyText },
    onboardingIntro: {
      ar: "أكمل ملفك بصدق؛ التوثيق يبني الثقة.",
      en: "Complete your profile honestly; verification builds trust.",
      tr: "Profilini dürüstçe tamamla; doğrulama güven oluşturur.",
    },
  },
};

/** Config management (flags, tunables, content) is admin+. */
export function canManageConfig(role: Role): boolean {
  return isAdminRole(role);
}

export type ConfigChange =
  | { kind: "flag"; key: string; value: boolean }
  | { kind: "limit"; key: string; value: number }
  | { kind: "content"; key: string; value: LocalizedText };

export type ConfigChangeResult =
  | { ok: true; path: string; value: boolean | number | LocalizedText }
  | { ok: false; reason: "unknownKey" | "outOfRange" | "invalidValue" };

const contentValueSchema = z.object({
  ar: z.string().max(CONTENT_MAX),
  en: z.string().max(CONTENT_MAX),
  tr: z.string().max(CONTENT_MAX),
});

/**
 * Validate a single config change against the allow-list and bounds. Returns
 * the dotted `path` (e.g. `limits.dailySends`) and the sanitized value, or a
 * typed rejection. Role is checked separately (see `canManageConfig`).
 */
export function validateConfigChange(change: ConfigChange): ConfigChangeResult {
  if (change.kind === "flag") {
    if (!CONFIG_FLAGS.includes(change.key as ConfigFlag))
      return { ok: false, reason: "unknownKey" };
    if (typeof change.value !== "boolean") return { ok: false, reason: "invalidValue" };
    return { ok: true, path: `flags.${change.key}`, value: change.value };
  }
  if (change.kind === "limit") {
    const spec = (CONFIG_LIMITS as Record<string, LimitSpec>)[change.key];
    if (spec === undefined) return { ok: false, reason: "unknownKey" };
    if (!Number.isInteger(change.value)) return { ok: false, reason: "invalidValue" };
    if (change.value < spec.min || change.value > spec.max)
      return { ok: false, reason: "outOfRange" };
    return { ok: true, path: `limits.${change.key}`, value: change.value };
  }
  if (!CONTENT_BLOCKS.includes(change.key as ContentBlockKey)) {
    return { ok: false, reason: "unknownKey" };
  }
  const parsed = contentValueSchema.safeParse(change.value);
  if (!parsed.success) return { ok: false, reason: "invalidValue" };
  return { ok: true, path: `content.${change.key}`, value: parsed.data };
}
