"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function RegisterForm() {
  const t = useTranslations("Auth");
  const [submitted, setSubmitted] = useState(false);

  const schema = z
    .object({
      email: z.string().min(1, t("errors.emailRequired")).email(t("errors.emailInvalid")),
      password: z.string().min(8, t("errors.passwordMin")),
      confirmPassword: z.string().min(1, t("errors.passwordRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("errors.confirmMismatch"),
      path: ["confirmPassword"],
    });
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 500));
    setSubmitted(true);
  });

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="flex flex-col gap-4">
      <Field
        label={t("fields.email")}
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder={t("fields.emailPlaceholder")}
        error={errors.email?.message}
        {...register("email")}
      />
      <Field
        label={t("fields.password")}
        type="password"
        autoComplete="new-password"
        placeholder={t("fields.passwordPlaceholder")}
        error={errors.password?.message}
        {...register("password")}
      />
      <Field
        label={t("fields.confirmPassword")}
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" block loading={isSubmitting}>
        {t("register.submit")}
      </Button>
      {submitted ? (
        <p role="status" className="rounded-md bg-info/10 px-3 py-2 text-sm text-info">
          {t("pendingNote")}
        </p>
      ) : null}
      <p className="text-center text-sm text-ink-600">
        {t("register.haveAccount")}{" "}
        <Link href="/auth/login" className="font-semibold text-primary-700 hover:underline">
          {t("register.loginLink")}
        </Link>
      </p>
    </form>
  );
}
