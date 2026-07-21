"use client";

import { useTranslations } from "next-intl";
import {
  CHILDREN_STATUSES,
  MARITAL_STATUSES,
  MARRIAGE_TIMELINES,
  RELIGIOUSNESS,
  LOCALES,
  DISCOVERY_SORTS,
  type DiscoveryFilters,
} from "@nisfi/shared";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select";
import { cn } from "@/lib/cn";

const AGE_MIN = 18;
const AGE_MAX = 80;

const MARITAL_KEY: Record<(typeof MARITAL_STATUSES)[number], string> = {
  single: "maritalSingle",
  divorced: "maritalDivorced",
  widowed: "maritalWidowed",
};
const CHILDREN_KEY: Record<(typeof CHILDREN_STATUSES)[number], string> = {
  none: "childrenNone",
  have: "childrenHave",
  preferNotToSay: "childrenPrefer",
};
const REL_KEY: Record<(typeof RELIGIOUSNESS)[number], string> = {
  practicing: "relPracticing",
  moderate: "relModerate",
  learning: "relLearning",
  preferNotToSay: "relPrefer",
};
const TIMELINE_KEY: Record<(typeof MARRIAGE_TIMELINES)[number], string> = {
  withinYear: "marriageWithinYear",
  oneToTwoYears: "marriageOneToTwo",
  notSure: "marriageNotSure",
};
const LANG_KEY: Record<(typeof LOCALES)[number], string> = {
  ar: "langAr",
  en: "langEn",
  tr: "langTr",
};

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary-50 text-primary-700"
          : "border-border bg-surface text-ink-600 hover:border-primary/50",
      )}
    >
      {children}
    </button>
  );
}

function toggle<T>(list: readonly T[] | undefined, value: T): T[] | undefined {
  const set = new Set(list ?? []);
  if (set.has(value)) set.delete(value);
  else set.add(value);
  const next = [...set];
  return next.length ? next : undefined;
}

export function FilterSheet({
  filters,
  onChange,
  open,
  onClose,
  onClear,
}: {
  filters: DiscoveryFilters;
  onChange: (next: DiscoveryFilters) => void;
  open: boolean;
  onClose: () => void;
  onClear: () => void;
}) {
  const t = useTranslations("Discover");
  const oRaw = useTranslations("Onboarding.options");
  const o = (key: string) => oRaw(key as Parameters<typeof oRaw>[0]);
  const set = (patch: Partial<DiscoveryFilters>) => onChange({ ...filters, ...patch });

  const ageOptions = (from: number) =>
    Array.from({ length: AGE_MAX - from + 1 }, (_, i) => {
      const v = from + i;
      return { value: String(v), label: String(v) };
    });

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 md:absolute md:inset-auto md:end-0 md:top-0",
        open ? "block" : "hidden",
      )}
      role="dialog"
      aria-modal="true"
      aria-label={t("filtersCta")}
    >
      {/* Scrim (mobile) */}
      <button
        type="button"
        aria-label={t("close")}
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 md:hidden"
      />
      <div className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto rounded-t-xl border-t border-border bg-surface p-5 shadow-card md:static md:max-h-none md:w-80 md:rounded-lg md:border">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-ink">{t("filtersTitle")}</h3>
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-semibold text-primary-700 hover:underline"
          >
            {t("clearAll")}
          </button>
        </div>

        <div className="flex flex-col gap-5">
          <SelectField
            label={t("sortLabel")}
            value={filters.sort}
            onChange={(e) => set({ sort: e.target.value as DiscoveryFilters["sort"] })}
            options={DISCOVERY_SORTS.map((s) => ({
              value: s,
              label: s === "newest" ? t("sortNewest") : t("sortRecentlyActive"),
            }))}
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">{t("ageRange")}</legend>
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label={t("ageFrom")}
                placeholder="—"
                value={filters.minAge ? String(filters.minAge) : ""}
                onChange={(e) =>
                  set({ minAge: e.target.value ? Number(e.target.value) : undefined })
                }
                options={ageOptions(AGE_MIN)}
              />
              <SelectField
                label={t("ageTo")}
                placeholder="—"
                value={filters.maxAge ? String(filters.maxAge) : ""}
                onChange={(e) =>
                  set({ maxAge: e.target.value ? Number(e.target.value) : undefined })
                }
                options={ageOptions(filters.minAge ?? AGE_MIN)}
              />
            </div>
          </fieldset>

          <Field
            label={t("countryLabel")}
            placeholder={t("countryPlaceholder")}
            value={filters.countries?.[0] ?? ""}
            onChange={(e) => set({ countries: e.target.value ? [e.target.value] : undefined })}
          />

          <Field
            label={t("cityLabel")}
            placeholder={t("cityPlaceholder")}
            value={filters.city ?? ""}
            onChange={(e) => set({ city: e.target.value || undefined })}
          />

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">{t("languagesLabel")}</legend>
            <div className="flex flex-wrap gap-2">
              {LOCALES.map((l) => (
                <Chip
                  key={l}
                  active={filters.languages?.includes(l) ?? false}
                  onClick={() => set({ languages: toggle(filters.languages, l) })}
                >
                  {o(LANG_KEY[l])}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">{t("maritalLabel")}</legend>
            <div className="flex flex-wrap gap-2">
              {MARITAL_STATUSES.map((m) => (
                <Chip
                  key={m}
                  active={filters.maritalStatuses?.includes(m) ?? false}
                  onClick={() => set({ maritalStatuses: toggle(filters.maritalStatuses, m) })}
                >
                  {o(MARITAL_KEY[m])}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">{t("childrenLabel")}</legend>
            <div className="flex flex-wrap gap-2">
              {CHILDREN_STATUSES.map((ch) => (
                <Chip
                  key={ch}
                  active={filters.children?.includes(ch) ?? false}
                  onClick={() => set({ children: toggle(filters.children, ch) })}
                >
                  {o(CHILDREN_KEY[ch])}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">{t("religiousnessLabel")}</legend>
            <div className="flex flex-wrap gap-2">
              {RELIGIOUSNESS.map((r) => (
                <Chip
                  key={r}
                  active={filters.religiousness?.includes(r) ?? false}
                  onClick={() => set({ religiousness: toggle(filters.religiousness, r) })}
                >
                  {o(REL_KEY[r])}
                </Chip>
              ))}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink">{t("timelineLabel")}</legend>
            <div className="flex flex-wrap gap-2">
              {MARRIAGE_TIMELINES.map((mt) => (
                <Chip
                  key={mt}
                  active={filters.marriageTimelines?.includes(mt) ?? false}
                  onClick={() => set({ marriageTimelines: toggle(filters.marriageTimelines, mt) })}
                >
                  {o(TIMELINE_KEY[mt])}
                </Chip>
              ))}
            </div>
          </fieldset>

          <Button block onClick={onClose} className="md:hidden">
            {t("showResults")}
          </Button>
        </div>
      </div>
    </div>
  );
}
