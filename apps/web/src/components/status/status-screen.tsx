"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { isLockedOut, type AccountStatus } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icon";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useAuth } from "@/lib/auth-context";
import { useAccountStatus } from "@/lib/use-account-status";
import { useRouter } from "@/i18n/navigation";

// Only the locked-out statuses are shown here; `active` never reaches the screen.
type LockedStatus = Exclude<AccountStatus, "active">;

export function StatusScreen() {
  const t = useTranslations("Status");
  const { user, configured, signOut } = useAuth();
  const { status, loading } = useAccountStatus();
  const router = useRouter();

  // In preview there is no locked-out session; show the suspended example.
  const shown: LockedStatus =
    configured && isLockedOut(status) ? (status as LockedStatus) : "suspended";

  useEffect(() => {
    if (!configured || loading) return;
    if (!user) router.replace("/auth/login");
    else if (!isLockedOut(status)) router.replace("/app");
  }, [configured, loading, user, status, router]);

  async function doSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-canvas p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border border-border bg-surface p-8 text-center shadow-card">
        <span
          className={
            shown === "suspended"
              ? "grid size-14 place-items-center rounded-full bg-warning/10 text-warning"
              : "grid size-14 place-items-center rounded-full bg-danger/10 text-danger"
          }
        >
          <LockIcon size={26} />
        </span>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-xl font-bold text-ink">
              {t(`${shown}.title` as "suspended.title")}
            </h1>
            {!configured ? <Badge tone="info">{t("previewNote")}</Badge> : null}
          </div>
          <p className="text-sm leading-relaxed text-ink-600">
            {t(`${shown}.body` as "suspended.body")}
          </p>
        </div>

        <p className="rounded-md border border-border bg-canvas px-3 py-2.5 text-xs text-ink-600">
          {t("supportNote")}
        </p>

        <Button variant="ghost" onClick={() => void doSignOut()}>
          {t("signOut")}
        </Button>

        <LocaleSwitcher />
      </div>
    </div>
  );
}
