import {
  canManageQuestions,
  isBreakingQuestionChange,
  questionInputSchema,
  reorderQuestions,
  type CompatibilityQuestion,
  type QuestionInput,
  type Role,
} from "@nisfi/shared";

/**
 * Compatibility-question management Cloud Function cores (master spec Section
 * 6.1, 12). Content writes are admin-only and server-side (rules deny client
 * writes to `questionBank`). The deployed callables run these in a transaction,
 * persist the question/orders, and append an audit event with the before/after.
 * SDK-free and unit-testable; Admin SDK wiring is deferred (O-001).
 */
export type QuestionWriteResult =
  | {
      ok: true;
      isNew: boolean;
      affectsExistingAnswers: boolean;
      question: QuestionInput;
    }
  | { ok: false; reason: "notAllowed" | "invalid" };

export function evaluateQuestionWrite(
  actorRole: Role,
  input: unknown,
  existing?: CompatibilityQuestion,
): QuestionWriteResult {
  if (!canManageQuestions(actorRole)) return { ok: false, reason: "notAllowed" };
  const parsed = questionInputSchema.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const affectsExistingAnswers = existing ? isBreakingQuestionChange(existing, parsed.data) : false;
  return { ok: true, isNew: existing === undefined, affectsExistingAnswers, question: parsed.data };
}

export type QuestionReorderResult =
  { ok: true; questions: CompatibilityQuestion[] } | { ok: false; reason: "notAllowed" };

export function evaluateQuestionReorder(
  actorRole: Role,
  questions: readonly CompatibilityQuestion[],
  id: string,
  direction: "up" | "down",
): QuestionReorderResult {
  if (!canManageQuestions(actorRole)) return { ok: false, reason: "notAllowed" };
  return { ok: true, questions: reorderQuestions(questions, id, direction) };
}
