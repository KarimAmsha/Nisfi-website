"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "@/i18n/navigation";

export function VerifyEmailContent() {
  const t = useTranslations("Auth.verify");
  const { user, reload, resendVerification, signOut } = useAuth();
  const router = useRouter();
  const [resent, setResent] = useState(false);
  const [notYet, setNotYet] = useState(false);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  const onResend = async () => {
    setResending(true);
    setResent(false);
    try {
      await resendVerification();
      setResent(true);
    } finally {
      setResending(false);
    }
  };

  const onCheck = async () => {
    setChecking(true);
    setNotYet(false);
    try {
      const fresh = await reload();
      if (fresh?.emailVerified) {
        router.push("/app");
      } else {
        setNotYet(true);
      }
    } finally {
      setChecking(false);
    }
  };

  const onSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-ink-600">
        {t("body", { email: user?.email ?? "" })}
      </p>
      <Button block loading={checking} onClick={() => void onCheck()}>
        {t("checkAgain")}
      </Button>
      <Button variant="ghost" block loading={resending} onClick={() => void onResend()}>
        {t("resend")}
      </Button>
      {resent ? (
        <p role="status" className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
          {t("resent")}
        </p>
      ) : null}
      {notYet ? (
        <p role="status" className="rounded-md bg-warning/10 px-3 py-2 text-sm text-warning">
          {t("notYet")}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void onSignOut()}
        className="text-center text-sm text-ink-600 hover:text-ink"
      >
        {t("signOut")}
      </button>
    </div>
  );
}
