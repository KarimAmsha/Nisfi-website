import { describe, expect, it } from "vitest";
import type { CompatibilityQuestion } from "@nisfi/shared";
import { evaluateQuestionReorder, evaluateQuestionWrite } from "./questions";

const input = {
  text: { ar: "نص", en: "text", tr: "metin" },
  options: [
    { id: "a", label: { ar: "أ", en: "a", tr: "a" } },
    { id: "b", label: { ar: "ب", en: "b", tr: "b" } },
  ],
  active: true,
};

const existing: CompatibilityQuestion = {
  id: "q1",
  order: 1,
  active: true,
  text: { ar: "نص", en: "text", tr: "metin" },
  options: input.options,
};

describe("evaluateQuestionWrite (CF core)", () => {
  it("refuses non-admins and invalid input", () => {
    expect(evaluateQuestionWrite("moderator", input)).toMatchObject({ reason: "notAllowed" });
    expect(evaluateQuestionWrite("admin", { text: {}, options: [] })).toMatchObject({
      reason: "invalid",
    });
  });

  it("accepts a new question (no answer impact)", () => {
    expect(evaluateQuestionWrite("admin", input)).toMatchObject({
      ok: true,
      isNew: true,
      affectsExistingAnswers: false,
    });
  });

  it("flags a breaking edit against an existing question", () => {
    // Replaces option "b" with "c" — still two options (valid), but "b" is gone.
    const swappedOption = {
      ...input,
      options: [input.options[0], { id: "c", label: { ar: "ج", en: "c", tr: "c" } }],
    };
    expect(evaluateQuestionWrite("admin", swappedOption, existing)).toMatchObject({
      ok: true,
      isNew: false,
      affectsExistingAnswers: true,
    });
  });
});

describe("evaluateQuestionReorder (CF core)", () => {
  const list: CompatibilityQuestion[] = [
    { ...existing, id: "one", order: 1 },
    { ...existing, id: "two", order: 2 },
  ];

  it("reorders for an admin and refuses others", () => {
    expect(evaluateQuestionReorder("admin", list, "two", "up")).toMatchObject({
      ok: true,
      questions: [
        { id: "two", order: 1 },
        { id: "one", order: 2 },
      ],
    });
    expect(evaluateQuestionReorder("user", list, "two", "up")).toMatchObject({
      reason: "notAllowed",
    });
  });
});
