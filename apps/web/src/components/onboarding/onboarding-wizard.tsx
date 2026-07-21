"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  CHILDREN_STATUSES,
  GENDERS,
  LOCALES,
  MARITAL_STATUSES,
  RELIGIOUSNESS,
} from "@nisfi/shared";
import { Field } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/auth-context";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { profileRepository } from "@/infrastructure/firebase/profile.repository";

const DRAFT_KEY = "nisfi.onboarding.draft.v1";
const LANGUAGE_LABEL_KEY = { ar: "langAr", en: "langEn", tr: "langTr" } as const;
const STEP_FIELDS = [
  ["displayName", "gender", "birthDate"],
  ["country", "city", "languages"],
  ["maritalStatus", "children", "religiousness"],
] as const;

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
  });
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { languages: [], ...loadDraft() } as Partial<Values>,
  });

  // Resumable: persist every change to localStorage.
  useEffect(() => {
    const sub = watch((values) => {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const selectedLanguages = watch("languages") ?? [];
  const toggleLanguage = (locale: (typeof LOCALES)[number]) => {
    const next = selectedLanguages.includes(locale)
      ? selectedLanguages.filter((l) => l !== locale)
      : [...selectedLanguages, locale];
    setValue("languages", next, { shouldValidate: true, shouldDirty: true });
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

  const stepTitles = [t("step1"), t("step2"), t("step3")];

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
                  {LOCALES.map((locale) => {
                    const active = selectedLanguages.includes(locale);
                    return (
                      <button
                        key={locale}
                        type="button"
                        onClick={() => toggleLanguage(locale)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm transition-colors",
                          active
                            ? "border-primary/40 bg-primary-50 font-semibold text-primary-700"
                            : "border-border text-ink-600 hover:border-primary",
                        )}
                      >
                        {t(`options.${LANGUAGE_LABEL_KEY[locale]}`)}
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
