"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocale, useTranslations } from "next-intl";
import {
  CHILDREN_STATUSES,
  GENDERS,
  localized,
  LOCALES,
  type Locale,
  MARITAL_STATUSES,
  MARRIAGE_TIMELINES,
  PROFILE_VISIBILITY,
  RELIGIOUSNESS,
  STARTER_QUESTIONS,
} from "@nisfi/shared";
import { Field } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { Link } from "@/i18n/navigation";
import { profileRepository } from "@/infrastructure/firebase/profile.repository";

const DRAFT_KEY = "nisfi.onboarding.draft.v1";
const LANGUAGE_LABEL_KEY = { ar: "langAr", en: "langEn", tr: "langTr" } as const;

function loadDraft(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(DRAFT_KEY) ?? "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function OnboardingWizard() {
  const t = useTranslations("Onboarding");
  const locale = useLocale();
  const { user, configured } = useAuth();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  const schema = z.object({
    displayName: z.string().trim().min(2, t("errors.displayNameMin")),
    gender: z.enum(GENDERS, { message: t("errors.required") }),
    birthDate: z
      .string()
      .min(1, t("errors.required"))
      .regex(/^\d{4}-\d{2}-\d{2}$/, t("errors.birthInvalid")),
    country: z.string().trim().min(2, t("errors.required")),
    city: z.string().trim().min(1, t("errors.required")),
    languages: z.array(z.enum(LOCALES)).min(1, t("errors.languagesMin")),
    maritalStatus: z.enum(MARITAL_STATUSES, { message: t("errors.required") }),
    children: z.enum(CHILDREN_STATUSES, { message: t("errors.required") }),
    religiousness: z.enum(RELIGIOUSNESS, { message: t("errors.required") }),
    education: z.string().trim().max(120).optional(),
    occupation: z.string().trim().max(120).optional(),
    marriageTimeline: z.enum(MARRIAGE_TIMELINES, { message: t("errors.required") }),
    about: z.string().trim().max(600).optional(),
    visibility: z.enum(PROFILE_VISIBILITY, { message: t("errors.required") }),
    answers: z.record(z.string(), z.string()).optional(),
  });
  type Values = z.infer<typeof schema>;

  const STEP_FIELDS: (keyof Values)[][] = [
    ["displayName", "gender", "birthDate"],
    ["country", "city", "languages"],
    ["maritalStatus", "children", "religiousness"],
    ["education", "occupation"],
    ["marriageTimeline", "about"],
    ["visibility"],
  ];

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { languages: [], answers: {}, ...loadDraft() } as Partial<Values>,
  });

  useEffect(() => {
    const sub = watch((values) => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const selectedLanguages = watch("languages") ?? [];
  const answers = watch("answers") ?? {};

  const toggleLanguage = (l: Locale) => {
    const next = selectedLanguages.includes(l)
      ? selectedLanguages.filter((x) => x !== l)
      : [...selectedLanguages, l];
    setValue("languages", next, { shouldValidate: true, shouldDirty: true });
  };

  const setAnswer = (questionId: string, optionId: string) => {
    setValue("answers", { ...answers, [questionId]: optionId }, { shouldDirty: true });
  };

  const goNext = async () => {
    const valid = await trigger(STEP_FIELDS[step]);
    if (valid) setStep((s) => Math.min(s + 1, STEP_FIELDS.length - 1));
  };

  const onFinish = handleSubmit(async (values) => {
    if (configured && user) {
      await profileRepository.saveOwn(user.uid, values);
      window.localStorage.removeItem(DRAFT_KEY);
    }
    setDone(true);
  });

  if (done) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-6 shadow-card">
        <h2 className="text-xl font-bold text-ink">{t("done.title")}</h2>
        <p className="text-sm leading-relaxed text-ink-600">{t("done.body")}</p>
        {!configured ? (
          <p className="rounded-md bg-info/10 px-3 py-2 text-sm text-info">{t("pendingNote")}</p>
        ) : null}
        <Link href="/app" className={buttonVariants()}>
          {t("done.goToApp")}
        </Link>
      </div>
    );
  }

  const stepTitles = [t("step1"), t("step2"), t("step3"), t("step4"), t("step5"), t("step6")];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm text-ink-600">
          <span>{t("progress", { current: step + 1, total: STEP_FIELDS.length })}</span>
          <span className="text-xs">{t("autoSaved")}</span>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {STEP_FIELDS.map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                index <= step ? "bg-primary" : "bg-border",
              )}
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
        <h2 className="mb-4 text-lg font-bold text-ink">{stepTitles[step]}</h2>
        <div className="flex flex-col gap-4">
          {step === 0 ? (
            <>
              <Field
                label={t("fields.displayName")}
                error={errors.displayName?.message}
                {...register("displayName")}
              />
              <SelectField
                label={t("fields.gender")}
                placeholder={t("choose")}
                error={errors.gender?.message}
                options={[
                  { value: "male", label: t("options.genderMale") },
                  { value: "female", label: t("options.genderFemale") },
                ]}
                {...register("gender")}
              />
              <Field
                label={t("fields.birthDate")}
                type="date"
                error={errors.birthDate?.message}
                {...register("birthDate")}
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <Field
                label={t("fields.country")}
                autoComplete="country-name"
                error={errors.country?.message}
                {...register("country")}
              />
              <Field
                label={t("fields.city")}
                autoComplete="address-level2"
                error={errors.city?.message}
                {...register("city")}
              />
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">{t("fields.languages")}</span>
                <div className="flex flex-wrap gap-2">
                  {LOCALES.map((l) => {
                    const active = selectedLanguages.includes(l);
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => toggleLanguage(l)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-colors",
                          active
                            ? "border-primary/40 bg-primary-50 font-semibold text-primary-700"
                            : "border-border text-ink-600 hover:border-primary",
                        )}
                      >
                        {t(`options.${LANGUAGE_LABEL_KEY[l]}`)}
                      </button>
                    );
                  })}
                </div>
                {errors.languages ? (
                  <p className="text-xs text-danger">{errors.languages.message}</p>
                ) : null}
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <SelectField
                label={t("fields.maritalStatus")}
                placeholder={t("choose")}
                error={errors.maritalStatus?.message}
                options={[
                  { value: "single", label: t("options.maritalSingle") },
                  { value: "divorced", label: t("options.maritalDivorced") },
                  { value: "widowed", label: t("options.maritalWidowed") },
                ]}
                {...register("maritalStatus")}
              />
              <SelectField
                label={t("fields.children")}
                placeholder={t("choose")}
                error={errors.children?.message}
                options={[
                  { value: "none", label: t("options.childrenNone") },
                  { value: "have", label: t("options.childrenHave") },
                  { value: "preferNotToSay", label: t("options.childrenPrefer") },
                ]}
                {...register("children")}
              />
              <SelectField
                label={t("fields.religiousness")}
                placeholder={t("choose")}
                error={errors.religiousness?.message}
                options={[
                  { value: "practicing", label: t("options.relPracticing") },
                  { value: "moderate", label: t("options.relModerate") },
                  { value: "learning", label: t("options.relLearning") },
                  { value: "preferNotToSay", label: t("options.relPrefer") },
                ]}
                {...register("religiousness")}
              />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Field
                label={`${t("fields.education")} ${t("optional")}`}
                error={errors.education?.message}
                {...register("education")}
              />
              <Field
                label={`${t("fields.occupation")} ${t("optional")}`}
                error={errors.occupation?.message}
                {...register("occupation")}
              />
            </>
          ) : null}

          {step === 4 ? (
            <>
              <SelectField
                label={t("fields.marriageTimeline")}
                placeholder={t("choose")}
                error={errors.marriageTimeline?.message}
                options={[
                  { value: "withinYear", label: t("options.marriageWithinYear") },
                  { value: "oneToTwoYears", label: t("options.marriageOneToTwo") },
                  { value: "notSure", label: t("options.marriageNotSure") },
                ]}
                {...register("marriageTimeline")}
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor="about" className="text-sm font-medium text-ink">
                  {`${t("fields.about")} ${t("optional")}`}
                </label>
                <textarea
                  id="about"
                  rows={4}
                  className="rounded-md border border-border bg-surface px-3.5 py-2.5 text-ink placeholder:text-ink-600/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  {...register("about")}
                />
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <p className="text-sm text-ink-600">{t("compatibilityHint")}</p>
              {STARTER_QUESTIONS.map((question) => (
                <SelectField
                  key={question.id}
                  label={localized(question.text, locale)}
                  placeholder={t("choose")}
                  value={answers[question.id] ?? ""}
                  onChange={(e) => setAnswer(question.id, e.target.value)}
                  options={question.options.map((option) => ({
                    value: option.id,
                    label: localized(option.label, locale),
                  }))}
                />
              ))}
              <SelectField
                label={t("fields.visibility")}
                placeholder={t("choose")}
                error={errors.visibility?.message}
                options={[
                  { value: "visible", label: t("options.visVisible") },
                  { value: "hidden", label: t("options.visHidden") },
                ]}
                {...register("visibility")}
              />
            </>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(s - 1, 0))}
          disabled={step === 0}
        >
          {t("back")}
        </Button>
        {step < STEP_FIELDS.length - 1 ? (
          <Button onClick={() => void goNext()}>{t("next")}</Button>
        ) : (
          <Button onClick={() => void onFinish()}>{t("finish")}</Button>
        )}
      </div>
    </div>
  );
}
