"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  BROADCAST_AUDIENCES,
  BROADCAST_BODY_MAX,
  BROADCAST_TITLE_MAX,
  broadcastInputSchema,
  type Broadcast,
  type BroadcastAudience,
  type BroadcastStatus,
  type LocalizedText,
} from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SelectField } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BellIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useBroadcasts } from "@/lib/use-broadcasts";

const LOCALES: readonly (keyof LocalizedText)[] = ["ar", "en", "tr"];
const EMPTY_TEXT: LocalizedText = { ar: "", en: "", tr: "" };

function statusTone(status: BroadcastStatus) {
  if (status === "sent") return "success" as const;
  if (status === "failed") return "danger" as const;
  if (status === "sending") return "info" as const;
  return "neutral" as const;
}

function LocalizedFields({
  value,
  onChange,
  rows,
  max,
  label,
}: {
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  rows: number;
  max: number;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LOCALES.map((loc) => (
          <textarea
            key={loc}
            value={value[loc]}
            dir={loc === "ar" ? "rtl" : "ltr"}
            rows={rows}
            maxLength={max}
            aria-label={`${label} — ${loc.toUpperCase()}`}
            placeholder={loc.toUpperCase()}
            onChange={(e) => onChange({ ...value, [loc]: e.target.value })}
            className={cn(
              "resize-none rounded-md border border-border bg-surface p-2 text-sm text-ink",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Composer({
  estimate,
  send,
}: {
  estimate: (audience: BroadcastAudience) => Promise<number>;
  send: (input: {
    audience: BroadcastAudience;
    title: LocalizedText;
    body: LocalizedText;
  }) => Promise<void>;
}) {
  const t = useTranslations("Admin.broadcasts");
  const [audience, setAudience] = useState<BroadcastAudience>("all");
  const [title, setTitle] = useState<LocalizedText>({ ...EMPTY_TEXT });
  const [body, setBody] = useState<LocalizedText>({ ...EMPTY_TEXT });
  const [count, setCount] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "confirming" | "sending" | "sent">("idle");

  const valid = broadcastInputSchema.safeParse({ audience, title, body }).success;

  function resetDryRun() {
    setCount(null);
    if (phase === "confirming") setPhase("idle");
  }

  async function dryRun() {
    setCount(await estimate(audience));
  }

  async function confirmSend() {
    setPhase("sending");
    await send({ audience, title, body });
    setPhase("sent");
    setTitle({ ...EMPTY_TEXT });
    setBody({ ...EMPTY_TEXT });
    setCount(null);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="font-bold text-ink">{t("composeTitle")}</h2>

      <SelectField
        label={t("audience")}
        value={audience}
        onChange={(e) => {
          setAudience(e.target.value as BroadcastAudience);
          resetDryRun();
        }}
        options={BROADCAST_AUDIENCES.map((a) => ({
          value: a,
          label: t(`audiences.${a}` as "audiences.all"),
        }))}
      />

      <LocalizedFields
        label={t("titleLabel")}
        value={title}
        onChange={(v) => {
          setTitle(v);
          resetDryRun();
        }}
        rows={1}
        max={BROADCAST_TITLE_MAX}
      />
      <LocalizedFields
        label={t("bodyLabel")}
        value={body}
        onChange={(v) => {
          setBody(v);
          resetDryRun();
        }}
        rows={3}
        max={BROADCAST_BODY_MAX}
      />

      {count !== null ? (
        <p className="rounded-md border border-info/25 bg-info/10 px-3 py-2.5 text-sm text-info">
          {t("dryRunResult", { count })}
        </p>
      ) : null}
      {phase === "sent" ? (
        <p className="rounded-md border border-success/25 bg-success/10 px-3 py-2.5 text-sm text-success">
          {t("sentNote")}
        </p>
      ) : null}

      {phase === "confirming" ? (
        <div className="flex flex-col gap-2 rounded-md border border-warning/30 bg-warning/10 p-3">
          <p className="text-sm text-warning">{t("confirmPrompt", { count: count ?? 0 })}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={() => void confirmSend()}>
              {t("confirmSend")}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPhase("idle")}>
              {t("cancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={!valid} onClick={() => void dryRun()}>
            {t("dryRun")}
          </Button>
          <Button
            size="sm"
            disabled={!valid || count === null || phase === "sending"}
            loading={phase === "sending"}
            onClick={() => setPhase("confirming")}
          >
            {t("send")}
          </Button>
        </div>
      )}
      <p className="text-xs text-ink-600">{t("sendHint")}</p>
    </div>
  );
}

function History({
  broadcasts,
  loading,
  error,
  preview,
}: {
  broadcasts: Broadcast[];
  loading: boolean;
  error: boolean;
  preview: boolean;
}) {
  const t = useTranslations("Admin.broadcasts");
  const locale = useLocale();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <h2 className="text-sm font-bold text-ink">{t("historyTitle")}</h2>
        <Badge tone="brand" className="tabular-nums">
          {broadcasts.length}
        </Badge>
        {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
      </div>
      {loading ? (
        <div className="flex flex-col gap-3 p-5">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="p-5">
          <EmptyState icon={<BellIcon />} title={t("errorTitle")} description={t("errorBody")} />
        </div>
      ) : broadcasts.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<BellIcon size={22} />}
            title={t("emptyTitle")}
            description={t("emptyDesc")}
          />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {broadcasts.map((b: Broadcast) => (
            <li key={b.id} className="flex flex-col gap-1 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {b.title[locale]}
                </span>
                <Badge tone={statusTone(b.status)} dot>
                  {t(`status.${b.status}` as "status.sent")}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-ink-600">
                <span>{t(`audiences.${b.audience}` as "audiences.all")}</span>
                <span className="tabular-nums">
                  {t("deliveryCounts", {
                    sent: b.sentCount,
                    targeted: b.targetedCount,
                    failed: b.failedCount,
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BroadcastsAdmin() {
  const { broadcasts, loading, error, preview, estimate, send } = useBroadcasts();
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
      <Composer estimate={estimate} send={send} />
      <History broadcasts={broadcasts} loading={loading} error={error} preview={preview} />
    </div>
  );
}
