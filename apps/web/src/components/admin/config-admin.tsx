"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  CONFIG_FLAGS,
  CONFIG_LIMITS,
  CONTENT_BLOCKS,
  CONTENT_MAX,
  type ConfigLimitKey,
  type LocalizedText,
} from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { useAppConfig } from "@/lib/use-app-config";

const LOCALES: readonly (keyof LocalizedText)[] = ["ar", "en", "tr"];

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-card">
      <div>
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {hint ? <p className="text-xs text-ink-600">{hint}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={onToggle}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
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
    </label>
  );
}

function LimitField({
  label,
  spec,
  value,
  onApply,
}: {
  label: string;
  spec: { min: number; max: number };
  value: number;
  onApply: (next: number) => Promise<boolean>;
}) {
  const t = useTranslations("Admin.config");
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState(false);

  useEffect(() => setDraft(String(value)), [value]);

  async function apply() {
    const parsed = Number(draft);
    if (parsed === value) return;
    const ok = await onApply(parsed);
    setError(!ok);
    if (!ok) setDraft(String(value));
  }

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="flex flex-col">
        <span className="text-sm text-ink">{label}</span>
        <span className="text-xs text-ink-600 tabular-nums">
          {t("range", { min: spec.min, max: spec.max })}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {error ? <span className="text-xs text-danger">{t("rangeError")}</span> : null}
        <input
          type="number"
          inputMode="numeric"
          min={spec.min}
          max={spec.max}
          value={draft}
          aria-label={label}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => void apply()}
          className={cn(
            "h-10 w-24 rounded-md border border-border bg-surface px-2.5 text-sm text-ink tabular-nums",
            "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            error && "border-danger",
          )}
        />
      </div>
    </div>
  );
}

function ContentBlock({
  label,
  value,
  onSave,
}: {
  label: string;
  value: LocalizedText;
  onSave: (next: LocalizedText) => Promise<boolean>;
}) {
  const t = useTranslations("Admin.config");
  const [draft, setDraft] = useState<LocalizedText>(value);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(value);
    setSaved(false);
  }, [value]);

  const dirty = LOCALES.some((l) => draft[l] !== value[l]);

  return (
    <div className="flex flex-col gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        {saved ? <Badge tone="success">{t("saved")}</Badge> : null}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LOCALES.map((loc) => (
          <textarea
            key={loc}
            value={draft[loc]}
            dir={loc === "ar" ? "rtl" : "ltr"}
            rows={2}
            maxLength={CONTENT_MAX}
            aria-label={`${label} — ${loc.toUpperCase()}`}
            placeholder={loc.toUpperCase()}
            onChange={(e) => {
              setDraft({ ...draft, [loc]: e.target.value });
              setSaved(false);
            }}
            className={cn(
              "resize-none rounded-md border border-border bg-surface p-2 text-sm text-ink",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          />
        ))}
      </div>
      <div>
        <Button
          size="sm"
          variant="ghost"
          disabled={!dirty}
          onClick={() => {
            void (async () => {
              const ok = await onSave(draft);
              setSaved(ok);
            })();
          }}
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

export function ConfigAdmin() {
  const t = useTranslations("Admin.config");
  const { config, loading, preview, update } = useAppConfig();

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {preview ? (
        <div>
          <Badge tone="info">{t("previewNote")}</Badge>
        </div>
      ) : null}

      <Section title={t("flagsTitle")} hint={t("flagsHint")}>
        {CONFIG_FLAGS.map((key) => (
          <Toggle
            key={key}
            label={t(`flags.${key}` as "flags.signupsEnabled")}
            on={config.flags[key]}
            onToggle={() => void update({ kind: "flag", key, value: !config.flags[key] })}
          />
        ))}
      </Section>

      <Section title={t("limitsTitle")} hint={t("limitsHint")}>
        {(Object.keys(CONFIG_LIMITS) as ConfigLimitKey[]).map((key) => (
          <LimitField
            key={key}
            label={t(`limits.${key}` as "limits.dailySends")}
            spec={CONFIG_LIMITS[key]}
            value={config.limits[key]}
            onApply={(value) => update({ kind: "limit", key, value })}
          />
        ))}
      </Section>

      <Section title={t("contentTitle")} hint={t("contentHint")}>
        {CONTENT_BLOCKS.map((key) => (
          <ContentBlock
            key={key}
            label={t(`content.${key}` as "content.announcement")}
            value={config.content[key]}
            onSave={(value) => update({ kind: "content", key, value })}
          />
        ))}
      </Section>

      <p className="text-xs text-ink-600">{t("auditNote")}</p>
    </div>
  );
}
