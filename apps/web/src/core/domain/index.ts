import { directionForLocale, type Direction, type Locale } from "@nisfi/shared";

/**
 * Domain layer (master spec Section 5.1): pure TypeScript types and entities.
 * No imports from `firebase/*` or `next/*` are permitted here.
 *
 * This seed re-exports the shared locale model and a pure helper so the
 * monorepo wiring (web -> @nisfi/shared) is verified from the scaffold onward.
 * Product entities from Section 10 are introduced in their approved units.
 */
export type AppLocale = Locale;

export function appDirection(locale: AppLocale): Direction {
  return directionForLocale(locale);
}
