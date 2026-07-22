"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  isBreakingQuestionChange,
  questionInputSchema,
  type CompatibilityQuestion,
  type LocalizedText,
  type QuestionInput,
} from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SparkIcon } from "@/components/ui/icon";
import { cn } from "@/lib/cn";
import { useQuestionsAdmin } from "@/lib/use-questions-admin";

const LOCALES: readonly (keyof LocalizedText)[] = ["ar", "en", "tr"];

type DraftOption = { id: string; label: LocalizedText };
type Draft = { id?: string; text: LocalizedText; options: DraftOption[]; active: boolean };

const EMPTY_TEXT: LocalizedText = { ar: "", en: "", tr: "" };

function emptyDraft(): Draft {
  return {
    text: { ...EMPTY_TEXT },
    options: [
      { id: newOptionId(), label: { ...EMPTY_TEXT } },
      { id: newOptionId(), label: { ...EMPTY_TEXT } },
    ],
    active: true,
  };
}

function newOptionId(): string {
  return `opt_${Math.random().toString(36).slice(2, 8)}`;
}

function toDraft(q: CompatibilityQuestion): Draft {
  return {
    id: q.id,
    text: { ...q.text },
    options: q.options.map((o) => ({ id: o.id, label: { ...o.label } })),
    active: q.active,
  };
}

function LocalizedInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-ink">{label}</span>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {LOCALES.map((loc) => (
          <input
            key={loc}
            value={value[loc]}
            dir={loc === "ar" ? "rtl" : "ltr"}
            onChange={(e) => onChange({ ...value, [loc]: e.target.value })}
            placeholder={loc.toUpperCase()}
            aria-label={`${label} — ${loc.toUpperCase()}`}
            className={cn(
              "h-10 rounded-md border border-border bg-surface px-2.5 text-sm text-ink",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Editor({
  original,
  onSave,
  onCancel,
}: {
  original: CompatibilityQuestion | null;
  onSave: (input: QuestionInput, id?: string) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Admin.questions");
  const [draft, setDraft] = useState<Draft>(original ? toDraft(original) : emptyDraft());
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    setDraft(original ? toDraft(original) : emptyDraft());
    setInvalid(false);
  }, [original]);

  const breaking =
    original !== null &&
    isBreakingQuestionChange(original, { options: draft.options, active: draft.active });

  function submit() {
    const input = { text: draft.text, options: draft.options, active: draft.active };
    const parsed = questionInputSchema.safeParse(input);
    if (!parsed.success) {
      setInvalid(true);
      return;
    }
    onSave(parsed.data, draft.id);
  }

  return (
    <aside className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-bold text-ink">{original ? t("editTitle") : t("newTitle")}</h2>
        <label className="flex items-center gap-2 text-sm text-ink-600">
          <input
            type="checkbox"
            checked={draft.active}
            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
            className="size-4 accent-[var(--color-primary)]"
          />
          {t("activeLabel")}
        </label>
      </div>

      <LocalizedInput
        label={t("questionText")}
        value={draft.text}
        onChange={(text) => setDraft({ ...draft, text })}
      />

      <div className="flex flex-col gap-3 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-ink">{t("options")}</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setDraft({
                ...draft,
                options: [...draft.options, { id: newOptionId(), label: { ...EMPTY_TEXT } }],
              })
            }
          >
            {t("addOption")}
          </Button>
        </div>
        {draft.options.map((opt, i) => (
          <div key={opt.id} className="flex flex-col gap-1.5 rounded-md border border-border p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-ink-600 tabular-nums">{opt.id}</span>
              <button
                type="button"
                disabled={draft.options.length <= 2}
                onClick={() =>
                  setDraft({ ...draft, options: draft.options.filter((_, j) => j !== i) })
                }
                className="text-xs text-danger disabled:cursor-not-allowed disabled:text-ink-600/40"
              >
                {t("removeOption")}
              </button>
            </div>
            <LocalizedInput
              label={t("optionLabel")}
              value={opt.label}
              onChange={(label) =>
                setDraft({
                  ...draft,
                  options: draft.options.map((o, j) => (j === i ? { ...o, label } : o)),
                })
              }
            />
          </div>
        ))}
      </div>

      {breaking ? (
        <p className="rounded-md border border-warning/25 bg-warning/10 px-3 py-2.5 text-xs text-warning">
          {t("breakingWarning")}
        </p>
      ) : null}
      {invalid ? <p className="text-xs text-danger">{t("invalid")}</p> : null}

      <div className="flex gap-2 border-t border-border pt-3">
        <Button size="sm" onClick={submit}>
          {t("save")}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {t("cancel")}
        </Button>
      </div>
    </aside>
  );
}

export function QuestionsAdmin() {
  const t = useTranslations("Admin.questions");
  const locale = useLocale();
  const { questions, loading, error, preview, save, reorder, setActive } = useQuestionsAdmin();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const selected = questions.find((q) => q.id === selectedId) ?? null;
  const editorOpen = creating || selected !== null;

  useEffect(() => {
    if (selectedId !== null && !questions.some((q) => q.id === selectedId)) setSelectedId(null);
  }, [questions, selectedId]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <h2 className="text-sm font-bold text-ink">{t("heading")}</h2>
          <Badge tone="brand" className="tabular-nums">
            {questions.length}
          </Badge>
          {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
          <Button
            size="sm"
            variant="ghost"
            className="ms-auto"
            onClick={() => {
              setSelectedId(null);
              setCreating(true);
            }}
          >
            {t("newQuestion")}
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <EmptyState icon={<SparkIcon />} title={t("errorTitle")} description={t("errorBody")} />
          </div>
        ) : questions.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<SparkIcon size={22} />}
              title={t("emptyTitle")}
              description={t("emptyDesc")}
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {questions.map((q, i) => (
              <li
                key={q.id}
                className={cn(
                  "flex items-center gap-3 px-5 py-3",
                  q.id === selectedId ? "bg-primary-50" : undefined,
                )}
              >
                <span className="flex flex-col">
                  <button
                    type="button"
                    className="text-xs text-ink-600 hover:text-primary disabled:text-ink-600/30"
                    disabled={i === 0}
                    aria-label={t("moveUp")}
                    onClick={() => void reorder(q.id, "up")}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="text-xs text-ink-600 hover:text-primary disabled:text-ink-600/30"
                    disabled={i === questions.length - 1}
                    aria-label={t("moveDown")}
                    onClick={() => void reorder(q.id, "down")}
                  >
                    ▼
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setSelectedId(q.id);
                  }}
                  className="flex min-w-0 flex-1 flex-col items-start text-start"
                >
                  <span className="truncate text-sm font-medium text-ink">{q.text[locale]}</span>
                  <span className="text-xs text-ink-600 tabular-nums">
                    {q.options.length} {t("optionsCount")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void setActive(q.id, !q.active)}
                  aria-label={q.active ? t("archive") : t("activate")}
                  title={q.active ? t("archive") : t("activate")}
                >
                  <Badge tone={q.active ? "success" : "neutral"} dot>
                    {q.active ? t("active") : t("archived")}
                  </Badge>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editorOpen ? (
        <Editor
          original={selected}
          onSave={(input, id) => {
            void save(input, id);
            setCreating(false);
            setSelectedId(null);
          }}
          onCancel={() => {
            setCreating(false);
            setSelectedId(null);
          }}
        />
      ) : (
        <aside className="grid place-items-center rounded-lg border border-dashed border-border bg-surface/60 p-8 text-center text-sm text-ink-600">
          {t("selectHint")}
        </aside>
      )}
    </div>
  );
}
