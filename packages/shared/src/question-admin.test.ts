import { describe, expect, it } from "vitest";
import type { CompatibilityQuestion } from "./compatibility";
import {
  canManageQuestions,
  isBreakingQuestionChange,
  questionInputSchema,
  removedOptionIds,
  reorderQuestions,
} from "./question-admin";

const q = (id: string, order: number, active = true): CompatibilityQuestion => ({
  id,
  order,
  active,
  text: { ar: "س", en: "q", tr: "s" },
  options: [
    { id: "a", label: { ar: "أ", en: "a", tr: "a" } },
    { id: "b", label: { ar: "ب", en: "b", tr: "b" } },
  ],
});

describe("canManageQuestions", () => {
  it("is admin+", () => {
    expect(canManageQuestions("admin")).toBe(true);
    expect(canManageQuestions("superAdmin")).toBe(true);
    expect(canManageQuestions("moderator")).toBe(false);
    expect(canManageQuestions("user")).toBe(false);
  });
});

describe("questionInputSchema", () => {
  const valid = {
    text: { ar: "نص", en: "text", tr: "metin" },
    options: [
      { id: "a", label: { ar: "أ", en: "a", tr: "a" } },
      { id: "b", label: { ar: "ب", en: "b", tr: "b" } },
    ],
    active: true,
  };

  it("accepts a fully-localized question with 2+ options", () => {
    expect(questionInputSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a blank translation and single-option questions", () => {
    expect(
      questionInputSchema.safeParse({ ...valid, text: { ar: "نص", en: "", tr: "metin" } }).success,
    ).toBe(false);
    expect(questionInputSchema.safeParse({ ...valid, options: [valid.options[0]] }).success).toBe(
      false,
    );
  });
});

describe("reorderQuestions", () => {
  const list = [q("one", 1), q("two", 2), q("three", 3)];

  it("moves a question up and renormalizes order", () => {
    const next = reorderQuestions(list, "two", "up");
    expect(next.map((x) => x.id)).toEqual(["two", "one", "three"]);
    expect(next.map((x) => x.order)).toEqual([1, 2, 3]);
  });

  it("moves down, and no-ops at the edges", () => {
    expect(reorderQuestions(list, "two", "down").map((x) => x.id)).toEqual(["one", "three", "two"]);
    expect(reorderQuestions(list, "one", "up").map((x) => x.id)).toEqual(["one", "two", "three"]);
    expect(reorderQuestions(list, "three", "down").map((x) => x.id)).toEqual([
      "one",
      "two",
      "three",
    ]);
  });
});

describe("removedOptionIds / isBreakingQuestionChange", () => {
  it("finds removed options", () => {
    expect(removedOptionIds([{ id: "a" }, { id: "b" }], [{ id: "a" }])).toEqual(["b"]);
    expect(removedOptionIds([{ id: "a" }], [{ id: "a" }, { id: "c" }])).toEqual([]);
  });

  it("flags removed options and archiving as breaking", () => {
    const prev = q("one", 1, true);
    expect(isBreakingQuestionChange(prev, { options: prev.options, active: true })).toBe(false);
    expect(isBreakingQuestionChange(prev, { options: [{ id: "a" }], active: true })).toBe(true);
    expect(isBreakingQuestionChange(prev, { options: prev.options, active: false })).toBe(true);
  });
});
