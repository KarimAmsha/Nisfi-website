import {
  canManageConfig,
  validateConfigChange,
  type AppConfig,
  type ConfigChange,
  type ConfigFlag,
  type ConfigLimitKey,
  type ContentBlockKey,
  type LocalizedText,
  type Role,
} from "@nisfi/shared";

/**
 * App-config Cloud Function core (master spec Section 6.2, 12). A single change
 * (flag / limit / content) is admin-gated and validated against the allow-list
 * and bounds; the result carries the dotted path plus the before/after so the
 * deployed callable can persist the value and append an immutable old→new audit
 * event. SDK-free and unit-testable; Admin SDK wiring is deferred (O-001).
 */
export type ConfigWriteResult =
  | {
      ok: true;
      path: string;
      before: boolean | number | LocalizedText;
      after: boolean | number | LocalizedText;
    }
  | { ok: false; reason: "notAllowed" | "unknownKey" | "outOfRange" | "invalidValue" };

function currentValue(change: ConfigChange, current: AppConfig): boolean | number | LocalizedText {
  if (change.kind === "flag") return current.flags[change.key as ConfigFlag];
  if (change.kind === "limit") return current.limits[change.key as ConfigLimitKey];
  return current.content[change.key as ContentBlockKey];
}

export function evaluateConfigChange(
  actorRole: Role,
  change: ConfigChange,
  current: AppConfig,
): ConfigWriteResult {
  if (!canManageConfig(actorRole)) return { ok: false, reason: "notAllowed" };
  const validated = validateConfigChange(change);
  if (!validated.ok) return validated;
  return {
    ok: true,
    path: validated.path,
    before: currentValue(change, current),
    after: validated.value,
  };
}
