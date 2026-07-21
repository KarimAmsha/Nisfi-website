import { z } from "zod";
import type { Locale } from "./locale";
import type { EditableProfile } from "./profile";

/**
 * Compatibility questions (master spec Section 10.9). Admin-managed via
 * `questionBank/{id}` in a later unit; the localized starter set here is
 * data-driven so the onboarding wizard renders it dynamically. Final wording,
 * ordering, and answer types remain an owner decision (D-008).
 */
export const localizedTextSchema = z.object({
  ar: z.string(),
  en: z.string(),
  tr: z.string(),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const compatibilityOptionSchema = z.object({
  id: z.string(),
  label: localizedTextSchema,
});

export const compatibilityQuestionSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  active: z.boolean(),
  text: localizedTextSchema,
  options: z.array(compatibilityOptionSchema).min(2),
});
export type CompatibilityQuestion = z.infer<typeof compatibilityQuestionSchema>;

export function localized(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

/** Draft starter question set (subject to owner approval, D-008). */
export const STARTER_QUESTIONS: readonly CompatibilityQuestion[] = [
  {
    id: "prayer",
    order: 1,
    active: true,
    text: { ar: "المحافظة على الصلاة", en: "Keeping up with prayer", tr: "Namaza devam" },
    options: [
      { id: "always", label: { ar: "دائمًا", en: "Always", tr: "Her zaman" } },
      { id: "mostly", label: { ar: "غالبًا", en: "Mostly", tr: "Çoğunlukla" } },
      { id: "improving", label: { ar: "أعمل على التحسّن", en: "Improving", tr: "Gelişiyorum" } },
    ],
  },
  {
    id: "relocate",
    order: 2,
    active: true,
    text: { ar: "الاستعداد للانتقال", en: "Openness to relocating", tr: "Taşınmaya açıklık" },
    options: [
      { id: "yes", label: { ar: "نعم", en: "Yes", tr: "Evet" } },
      { id: "maybe", label: { ar: "ربما", en: "Maybe", tr: "Belki" } },
      { id: "no", label: { ar: "لا", en: "No", tr: "Hayır" } },
    ],
  },
  {
    id: "familyPlan",
    order: 3,
    active: true,
    text: { ar: "الرغبة في الإنجاب", en: "Wanting children", tr: "Çocuk isteme" },
    options: [
      { id: "yes", label: { ar: "نعم", en: "Yes", tr: "Evet" } },
      { id: "open", label: { ar: "منفتح", en: "Open", tr: "Açığım" } },
      { id: "unsure", label: { ar: "غير متأكد", en: "Unsure", tr: "Emin değilim" } },
    ],
  },
];

/** Public-profile fields that count toward completion. */
const COMPLETION_FIELDS: readonly (keyof EditableProfile)[] = [
  "displayName",
  "gender",
  "birthDate",
  "country",
  "city",
  "languages",
  "maritalStatus",
  "children",
  "religiousness",
  "marriageTimeline",
  "about",
  "visibility",
];

/**
 * Profile completion as an integer percentage (0–100) over the tracked fields
 * plus answered starter questions. Used by the app-access completion gate.
 */
export function computeProfileCompletion(
  profile: Partial<EditableProfile>,
  questionCount: number = STARTER_QUESTIONS.length,
): number {
  const total = COMPLETION_FIELDS.length + questionCount;
  let filled = 0;
  for (const field of COMPLETION_FIELDS) {
    const value = profile[field];
    if (Array.isArray(value) ? value.length > 0 : value !== undefined && value !== "") {
      filled += 1;
    }
  }
  filled += Math.min(Object.keys(profile.answers ?? {}).length, questionCount);
  return Math.round((filled / total) * 100);
}
