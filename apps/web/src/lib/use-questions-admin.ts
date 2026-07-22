"use client";

import { useCallback, useEffect, useState } from "react";
import { reorderQuestions, STARTER_QUESTIONS, type CompatibilityQuestion, type QuestionInput } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { questionRepository } from "@/infrastructure/firebase/question.repository";

// Preview seed: the starter set plus one archived example so the console shows
// both states.
const PREVIEW_QUESTIONS: CompatibilityQuestion[] = [
  ...STARTER_QUESTIONS.map((q) => ({ ...q })),
  {
    id: "smoking",
    order: STARTER_QUESTIONS.length + 1,
    active: false,
    text: { ar: "التدخين", en: "Smoking", tr: "Sigara" },
    options: [
      { id: "no", label: { ar: "لا", en: "No", tr: "Hayır" } },
      { id: "sometimes", label: { ar: "أحيانًا", en: "Sometimes", tr: "Bazen" } },
      { id: "yes", label: { ar: "نعم", en: "Yes", tr: "Evet" } },
    ],
  },
];

export interface UseQuestionsAdminResult {
  questions: CompatibilityQuestion[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  save: (input: QuestionInput, id?: string) => Promise<void>;
  reorder: (id: string, direction: "up" | "down") => Promise<void>;
  setActive: (id: string, active: boolean) => Promise<void>;
  reload: () => void;
}

export function useQuestionsAdmin(): UseQuestionsAdminResult {
  const { configured, user } = useAuth();
  const [questions, setQuestions] = useState<CompatibilityQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setQuestions(PREVIEW_QUESTIONS);
      setLoading(false);
      return;
    }
    if (!user) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    questionRepository
      .listQuestions()
      .then(setQuestions)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const save = useCallback(
    async (input: QuestionInput, id?: string) => {
      setQuestions((prev) => {
        if (id === undefined) {
          const newQuestion: CompatibilityQuestion = {
            id: `new_${Date.now()}`,
            order: prev.length + 1,
            active: input.active,
            text: input.text,
            options: input.options,
          };
          return [...prev, newQuestion];
        }
        return prev.map((q) => (q.id === id ? { ...q, ...input } : q));
      });
      if (configured) await questionRepository.saveQuestion(input, id);
    },
    [configured],
  );

  const reorder = useCallback(
    async (id: string, direction: "up" | "down") => {
      setQuestions((prev) => reorderQuestions(prev, id, direction));
      if (configured) await questionRepository.reorderQuestion(id, direction);
    },
    [configured],
  );

  const setActive = useCallback(
    async (id: string, active: boolean) => {
      setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, active } : q)));
      if (configured) await questionRepository.setQuestionActive(id, active);
    },
    [configured],
  );

  return {
    questions,
    loading,
    error,
    preview: !configured,
    save,
    reorder,
    setActive,
    reload: load,
  };
}
