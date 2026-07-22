"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { NOTIFICATION_CATEGORIES, type Locale } from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { LockIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/auth-context";
import { useMemberSettings } from "@/lib/use-member-settings";
import { usePrivacy } from "@/lib/use-privacy";

const LOCALES: readonly Locale[] = ["ar", "en", "tr"];

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          on ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition-all",
            on ? "start-[1.375rem]" : "start-0.5",
          )}
        />
      </button>
    </div>
  );
}

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5">
      <div>
        <h2 className="font-bold text-ink">{title}</h2>
        {description ? <p className="text-sm text-ink-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function SettingsPanel() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const { signOut } = useAuth();
  const { preferences, locale, visibility, preview, toggleNotification, setLocale, setVisibility } =
    useMemberSettings();
  const { exportData, deleteAccount } = usePrivacy();
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [deletePhase, setDeletePhase] = useState<"idle" | "confirm" | "deleting">("idle");
  const [acknowledged, setAcknowledged] = useState(false);

  async function doSignOut() {
    await signOut();
    router.push("/");
  }

  async function doExport() {
    setExporting(true);
    try {
      const bundle = await exportData();
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nisfi-my-data.json";
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
    } finally {
      setExporting(false);
    }
  }

  async function doDelete() {
    setDeletePhase("deleting");
    await deleteAccount();
    await signOut().catch(() => undefined);
    router.push("/");
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold text-ink">{t("title")}</h1>
        {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
      </div>

      <SettingsCard title={t("visibilityTitle")} description={t("visibilityDesc")}>
        <Toggle
          label={visibility === "visible" ? t("visibilityOn") : t("visibilityOff")}
          on={visibility === "visible"}
          onToggle={() => void setVisibility(visibility === "visible" ? "hidden" : "visible")}
        />
      </SettingsCard>

      <SettingsCard title={t("languageTitle")} description={t("languageDesc")}>
        <SelectField
          label={t("languageTitle")}
          value={locale ?? ""}
          onChange={(e) => void setLocale(e.target.value as Locale)}
          placeholder={t("languageAuto")}
          options={LOCALES.map((l) => ({ value: l, label: t(`locales.${l}` as "locales.ar") }))}
        />
      </SettingsCard>

      <SettingsCard title={t("notificationsTitle")} description={t("notificationsDesc")}>
        <div className="flex flex-col divide-y divide-border">
          {NOTIFICATION_CATEGORIES.map((category) => (
            <Toggle
              key={category}
              label={t(`categories.${category}` as "categories.requests")}
              on={preferences.notifications[category]}
              onToggle={() => void toggleNotification(category)}
            />
          ))}
        </div>
      </SettingsCard>

      <Link
        href="/app/settings/blocked"
        className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-primary/40"
      >
        <span className="grid size-10 place-items-center rounded-full bg-primary-50 text-primary-700">
          <LockIcon size={19} />
        </span>
        <span className="flex flex-col">
          <span className="font-semibold text-ink">{t("blockedLink")}</span>
          <span className="text-sm text-ink-600">{t("blockedHint")}</span>
        </span>
      </Link>

      <SettingsCard title={t("accountTitle")}>
        <div className="flex flex-col gap-3">
          <Button variant="ghost" onClick={() => void doSignOut()}>
            {t("signOut")}
          </Button>

          <div className="flex flex-col gap-2 border-t border-border pt-3">
            <p className="text-xs font-semibold text-ink-600">{t("privacyTitle")}</p>

            {exported ? (
              <p className="rounded-md border border-success/25 bg-success/10 px-3 py-2.5 text-sm text-success">
                {t("exportReady")}
              </p>
            ) : null}

            {deletePhase !== "idle" ? (
              <div className="flex flex-col gap-2 rounded-md border border-danger/30 bg-danger/5 p-3">
                <p className="text-sm text-danger">{t("deleteConfirm")}</p>
                <label className="flex items-start gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(e) => setAcknowledged(e.target.checked)}
                    className="mt-0.5 size-4 accent-[var(--color-danger)]"
                  />
                  {t("deleteAcknowledge")}
                </label>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={!acknowledged || deletePhase === "deleting"}
                    loading={deletePhase === "deleting"}
                    onClick={() => void doDelete()}
                  >
                    {t("deleteFinal")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDeletePhase("idle");
                      setAcknowledged(false);
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  loading={exporting}
                  onClick={() => void doExport()}
                >
                  {t("exportData")}
                </Button>
                <Button size="sm" variant="danger" onClick={() => setDeletePhase("confirm")}>
                  {t("deleteAccount")}
                </Button>
              </div>
            )}
            <p className="text-xs text-ink-600">{t("privacyNote")}</p>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
