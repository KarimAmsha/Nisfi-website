import { describe, expect, it } from "vitest";
import {
  compatibilityQuestionSchema,
  computeProfileCompletion,
  localized,
  STARTER_QUESTIONS,
} from "./compatibility";

describe("compatibility questions", () => {
  it("ships a valid, localized starter set", () => {
    expect(STARTER_QUESTIONS.length).toBeGreaterThan(0);
    for (const question of STARTER_QUESTIONS) {
      expect(compatibilityQuestionSchema.safeParse(question).success).toBe(true);
    }
  });

  it("resolves localized text by locale", () => {
    expect(localized(STARTER_QUESTIONS[0]!.text, "ar")).toBeTruthy();
    expect(localized(STARTER_QUESTIONS[0]!.text, "en")).toBeTruthy();
  });
});

describe("computeProfileCompletion", () => {
  it("returns 0 for an empty profile", () => {
    expect(computeProfileCompletion({})).toBe(0);
  });

  it("increases as fields and answers are filled", () => {
    const partial = computeProfileCompletion({ displayName: "Aisha", gender: "female" });
    expect(partial).toBeGreaterThan(0);
    expect(partial).toBeLessThan(100);
  });

  it("reaches 100 when all tracked fields and questions are complete", () => {
    const complete = computeProfileCompletion({
      displayName: "Aisha",
      gender: "female",
      birthDate: "1996-05-01",
      country: "TR",
      city: "Istanbul",
      languages: ["ar", "en"],
      maritalStatus: "single",
      children: "none",
      religiousness: "practicing",
      marriageTimeline: "withinYear",
      about: "A short intro.",
      visibility: "visible",
      answers: { prayer: "always", relocate: "yes", familyPlan: "yes" },
    });
    expect(complete).toBe(100);
  });
});
