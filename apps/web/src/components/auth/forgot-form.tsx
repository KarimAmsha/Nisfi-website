"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Field } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export function ForgotForm() {
  const t = useTranslations("Auth");
  const [sent, setSent] = useState(false);

  const schema = z.object({
    email: z.string().min(1, t("errors.emailRequired")).email(t("errors.emailInvalid")),
  });
  type Values = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 500));
    setSent(true);
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
      <Button type="submit" block loading={isSubmitting}>
        {t("forgot.submit")}
      </Button>
      {sent ? (
        <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          {t("forgotSent")}
        </p>
      ) : null}
      <p className="text-center text-sm text-ink-600">
        <Link href="/auth/login" className="font-semibold text-primary-700 hover:underline">
          {t("forgot.backToLogin")}
        </Link>
      </p>
    </form>
  );
}
