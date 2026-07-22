"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BellIcon } from "@/components/ui/icon";
import { usePush } from "@/lib/use-push";

/**
 * Push permission education (master spec F9). Shown as a card the member can act
 * on — permission is requested only when they click Enable, never on load. Once
 * granted or dismissed, the card hides.
 */
export function PushPrompt() {
  const t = useTranslations("Push");
  const { permission, preview, enable } = usePush();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || permission === "granted" || permission === "denied") return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-primary-50/50 p-4 sm:flex-row sm:items-center">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-50 text-primary-700">
        <BellIcon size={19} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold text-ink">{t("title")}</span>
        <span className="text-sm text-ink-600">
          {permission === "unsupported" ? t("unsupported") : t("body")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
        {permission !== "unsupported" ? (
          <Button size="sm" onClick={() => void enable()}>
            {t("enable")}
          </Button>
        ) : null}
        <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
          {t("dismiss")}
        </Button>
      </div>
    </div>
  );
}
