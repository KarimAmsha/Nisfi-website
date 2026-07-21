"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { discoveryFiltersSchema, type DiscoveryFilters } from "@nisfi/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { CompassIcon, SettingsIcon } from "@/components/ui/icon";
import { useDiscovery } from "@/lib/use-discovery";
import { DiscoveryCard } from "@/components/discovery/discovery-card";
import { FilterSheet } from "@/components/discovery/filter-sheet";

const STORAGE_KEY = "nisfi.discoveryFilters";
const DEFAULTS = discoveryFiltersSchema.parse({});

type ActiveChip = { id: string; label: string; clear: () => void };

export function DiscoveryBrowser() {
  const t = useTranslations("Discover");
  const oRaw = useTranslations("Onboarding.options");
  const o = (key: string) => oRaw(key as Parameters<typeof oRaw>[0]);
  const [filters, setFilters] = useState<DiscoveryFilters>(DEFAULTS);
  const [restored, setRestored] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Restore saved filters (real per-user persistence to users.settings lands
  // with the deferred wiring, O-001).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = discoveryFiltersSchema.safeParse(JSON.parse(raw));
        if (parsed.success) setFilters(parsed.data);
      }
    } catch {
      /* ignore malformed storage */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      /* storage may be unavailable */
    }
  }, [filters, restored]);

  const { items, loading, loadingMore, error, hasMore, preview, loadMore, reload } =
    useDiscovery(filters);

  const activeChips = useMemo<ActiveChip[]>(() => {
    const chips: ActiveChip[] = [];
    const patch = (p: Partial<DiscoveryFilters>) => setFilters((f) => ({ ...f, ...p }));
    if (filters.sort === "recentlyActive") {
      chips.push({
        id: "sort",
        label: t("sortRecentlyActive"),
        clear: () => patch({ sort: "newest" }),
      });
    }
    if (filters.minAge || filters.maxAge) {
      chips.push({
        id: "age",
        label: `${filters.minAge ?? 18}–${filters.maxAge ?? 80}`,
        clear: () => patch({ minAge: undefined, maxAge: undefined }),
      });
    }
    filters.countries?.forEach((cty) =>
      chips.push({
        id: `country-${cty}`,
        label: cty,
        clear: () => patch({ countries: undefined }),
      }),
    );
    if (filters.city) {
      chips.push({ id: "city", label: filters.city, clear: () => patch({ city: undefined }) });
    }
    const enumChip = <K extends keyof DiscoveryFilters>(
      field: K,
      values: readonly string[] | undefined,
      labelKey: (v: string) => string,
    ) =>
      values?.forEach((v) =>
        chips.push({
          id: `${String(field)}-${v}`,
          label: o(labelKey(v)),
          clear: () =>
            patch({
              [field]:
                (filters[field] as string[] | undefined)?.filter((x) => x !== v) ?? undefined,
            }),
        }),
      );
    enumChip(
      "languages",
      filters.languages,
      (v) => `lang${v.charAt(0).toUpperCase()}${v.slice(1)}`,
    );
    enumChip("maritalStatuses", filters.maritalStatuses, (v) =>
      v === "single" ? "maritalSingle" : v === "divorced" ? "maritalDivorced" : "maritalWidowed",
    );
    enumChip("children", filters.children, (v) =>
      v === "none" ? "childrenNone" : v === "have" ? "childrenHave" : "childrenPrefer",
    );
    enumChip("religiousness", filters.religiousness, (v) =>
      v === "practicing"
        ? "relPracticing"
        : v === "moderate"
          ? "relModerate"
          : v === "learning"
            ? "relLearning"
            : "relPrefer",
    );
    enumChip("marriageTimelines", filters.marriageTimelines, (v) =>
      v === "withinYear"
        ? "marriageWithinYear"
        : v === "oneToTwoYears"
          ? "marriageOneToTwo"
          : "marriageNotSure",
    );
    return chips;
  }, [filters, t, o]);

  const clearAll = () => setFilters(DEFAULTS);

  return (
    <section className="relative flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-ink">{t("title")}</h2>
        <p className="max-w-[52ch] text-sm text-ink-600">{t("subtitle")}</p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setSheetOpen(true)}>
          <SettingsIcon size={16} />
          {t("filtersCta")}
          {activeChips.length ? (
            <span className="ms-1 rounded-full bg-primary px-1.5 text-xs text-white tabular-nums">
              {activeChips.length}
            </span>
          ) : null}
        </Button>
        {activeChips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={chip.clear}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-[#e2f0ea]"
          >
            {chip.label}
            <span aria-hidden>×</span>
          </button>
        ))}
        {activeChips.length ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-semibold text-ink-600 underline-offset-2 hover:underline"
          >
            {t("clearAll")}
          </button>
        ) : null}
        <span className="ms-auto text-sm text-ink-600">{t("resultsHint")}</span>
      </div>

      {preview ? (
        <Badge tone="info" className="self-start">
          {t("previewNote")}
        </Badge>
      ) : null}

      {loading ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="overflow-hidden rounded-lg border border-border bg-surface">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
                <Skeleton className="mt-2 h-9 w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : error ? (
        <EmptyState
          icon={<CompassIcon />}
          title={t("errorTitle")}
          description={t("errorBody")}
          action={
            <Button variant="ghost" size="sm" onClick={reload}>
              {t("retry")}
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CompassIcon />}
          title={t("emptyTitle")}
          description={t("emptyBody")}
          action={
            activeChips.length ? (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                {t("clearAll")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((candidate) => (
              <DiscoveryCard key={candidate.uid} candidate={candidate} />
            ))}
          </ul>
          {hasMore ? (
            <div className="flex justify-center pt-2">
              <Button variant="ghost" onClick={loadMore} loading={loadingMore}>
                {t("loadMore")}
              </Button>
            </div>
          ) : null}
        </>
      )}

      <FilterSheet
        filters={filters}
        onChange={setFilters}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onClear={clearAll}
      />
    </section>
  );
}
