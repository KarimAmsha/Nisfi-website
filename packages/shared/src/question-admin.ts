import { z } from "zod";
import { localizedTextSchema, type CompatibilityQuestion } from "./compatibility";
import { isAdminRole, type Role } from "./role";

/**
 * Compatibility-question management authority (master spec Section 6.1, F10).
 * Questions live in `questionBank/{id}` — readable by signed-in members (the
 * onboarding wizard renders them), writable only server-side (admin, audited).
 * These pure helpers validate edits, reorder siblings, and flag edits that
 * would orphan existing member answers so the console can warn before saving.
 */

/** Content management (questions, config) is admin+. */
export function canManageQuestions(role: Role): boolean {
  return isAdminRole(role);
}

/** Localized text with every locale filled — blank translations are rejected. */
const filledLocalizedText = localizedTextSchema.refine(
  (t) => t.ar.trim() !== "" && t.en.trim() !== "" && t.tr.trim() !== "",
  { message: "allLocalesRequired" },
);

export const questionOptionInputSchema = z.object({
  id: z.string().trim().min(1),
  label: filledLocalizedText,
});

export const questionInputSchema = z.object({
  text: filledLocalizedText,
  options: z.array(questionOptionInputSchema).min(2),
  active: z.boolean(),
});
export type QuestionInput = z.infer<typeof questionInputSchema>;

/**
 * Move a question up/down among its siblings, returning the whole list with
 * `order` normalized to a 1-based sequence. Out-of-range moves are a no-op
 * (still normalized). Pure — the server persists the new orders.
 */
export function reorderQuestions(
  questions: readonly CompatibilityQuestion[],
  id: string,
  direction: "up" | "down",
): CompatibilityQuestion[] {
  const sorted = [...questions].sort((a, b) => a.order - b.order);
  const normalize = (list: CompatibilityQuestion[]) =>
    list.map((q, idx) => ({ ...q, order: idx + 1 }));
  const i = sorted.findIndex((q) => q.id === id);
  if (i === -1) return normalize(sorted);
  const j = direction === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= sorted.length) return normalize(sorted);
  const a = sorted[i]!;
  const b = sorted[j]!;
  sorted[i] = b;
  sorted[j] = a;
  return normalize(sorted);
}

/** Option ids present before an edit but gone after — answers pointing at them
 * would be orphaned. */
export function removedOptionIds(
  prev: readonly { id: string }[],
  next: readonly { id: string }[],
): string[] {
  const keep = new Set(next.map((o) => o.id));
  return prev.filter((o) => !keep.has(o.id)).map((o) => o.id);
}

/**
 * Whether an edit is "breaking" for existing member answers — an option was
 * removed, or an active question is being archived. Drives the console's
 * "affects existing answers" warning (master spec 6.1 acceptance).
 */
export function isBreakingQuestionChange(
  prev: CompatibilityQuestion,
  next: { options: readonly { id: string }[]; active: boolean },
): boolean {
  return removedOptionIds(prev.options, next.options).length > 0 || (prev.active && !next.active);
}
