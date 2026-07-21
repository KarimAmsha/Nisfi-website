"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function LoginForm() {
  const t = useTranslations("Auth");
  const [submitted, setSubmitted] = useState(false);

  const schema = z.object({
    email: z.string().min(1, t("errors.emailRequired")).email(t("errors.emailInvalid")),
    password: z.string().min(1, t("errors.passwordRequired")),
  });
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async () => {
    // Auth backend is wired in Unit 1.4 (Firebase Auth emulator). For now the
    // form validates and shows a truthful pending state.
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
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <div className="-mt-1 flex justify-end">
        <Link href="/auth/forgot" className="text-sm text-primary-700 hover:underline">
          {t("login.forgotLink")}
        </Link>
      </div>
      <Button type="submit" block loading={isSubmitting}>
        {t("login.submit")}
      </Button>
      {submitted ? (
        <p role="status" className="rounded-md bg-info/10 px-3 py-2 text-sm text-info">
          {t("pendingNote")}
        </p>
      ) : null}
      <p className="text-center text-sm text-ink-600">
        {t("login.noAccount")}{" "}
        <Link href="/auth/register" className="font-semibold text-primary-700 hover:underline">
          {t("login.registerLink")}
        </Link>
      </p>
    </form>
  );
}
