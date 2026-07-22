import { collection, getDocs, orderBy, query, type DocumentData } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import type { CompatibilityQuestion, LocalizedText, QuestionInput } from "@nisfi/shared";
import type { QuestionRepository } from "@/core/ports/question";
import { firebaseFirestore, firebaseFunctions } from "./client";

function toQuestion(id: string, data: DocumentData): CompatibilityQuestion {
  return {
    id,
    order: (data.order as number | undefined) ?? 0,
    active: (data.active as boolean | undefined) ?? true,
    text: (data.text as LocalizedText | undefined) ?? { ar: "", en: "", tr: "" },
    options: (data.options as CompatibilityQuestion["options"] | undefined) ?? [],
  };
}

class FirestoreQuestionRepository implements QuestionRepository {
  async listQuestions(): Promise<CompatibilityQuestion[]> {
    const snap = await getDocs(
      query(collection(firebaseFirestore(), "questionBank"), orderBy("order", "asc")),
    );
    return snap.docs.map((d) => toQuestion(d.id, d.data()));
  }

  async saveQuestion(input: QuestionInput, id?: string): Promise<void> {
    const callable = httpsCallable<{ input: QuestionInput; id?: string }, void>(
      firebaseFunctions(),
      "saveQuestion",
    );
    await callable(id !== undefined ? { input, id } : { input });
  }

  async reorderQuestion(id: string, direction: "up" | "down"): Promise<void> {
    const callable = httpsCallable<{ id: string; direction: "up" | "down" }, void>(
      firebaseFunctions(),
      "reorderQuestion",
    );
    await callable({ id, direction });
  }

  async setQuestionActive(id: string, active: boolean): Promise<void> {
    const callable = httpsCallable<{ id: string; active: boolean }, void>(
      firebaseFunctions(),
      "setQuestionActive",
    );
    await callable({ id, active });
  }
}

export const questionRepository: QuestionRepository = new FirestoreQuestionRepository();
