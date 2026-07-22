import type { CompatibilityQuestion, QuestionInput } from "@nisfi/shared";

/**
 * QuestionRepository port (master spec Section 6.1, F10). The admin console
 * reads the full question bank (active + archived) and mutates it through
 * server-side content Cloud Functions — validation, ordering, and audit run on
 * the server; clients never write `questionBank` directly.
 */
export interface QuestionRepository {
  /** All questions, ordered by `order` (staff read; includes archived). */
  listQuestions(): Promise<CompatibilityQuestion[]>;
  /** Create (id omitted) or update (id given) a question — validated + audited. */
  saveQuestion(input: QuestionInput, id?: string): Promise<void>;
  /** Move a question up/down among its siblings (server renormalizes order). */
  reorderQuestion(id: string, direction: "up" | "down"): Promise<void>;
  /** Activate or archive a question. */
  setQuestionActive(id: string, active: boolean): Promise<void>;
}
