"use client";

import { useTranslations } from "next-intl";
import type { DiscoveryCandidate } from "@nisfi/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { LockIcon, ShieldCheckIcon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";

/** A privacy-first discovery card (master spec Section 14 «Discovery»): the
 * photo is a protected placeholder — never a CSS-blurred real image — with
 * meaningful compatibility signals and verified status. Contact happens via a
 * written connection request (Unit 3.4), so the actions are affordances here. */
export function DiscoveryCard({ candidate }: { candidate: DiscoveryCandidate }) {
  const t = useTranslations("Discover");
  const c = useTranslations("Common");
  const oRaw = useTranslations("Onboarding.options");
  const o = (key: string) => oRaw(key as Parameters<typeof oRaw>[0]);

  const initial = candidate.city.charAt(0).toUpperCase() || "•";
  const religiousnessKey = {
    practicing: "relPracticing",
    moderate: "relModerate",
    learning: "relLearning",
    preferNotToSay: "relPrefer",
  }[candidate.religiousness];
  const timelineKey = {
    withinYear: "marriageWithinYear",
    oneToTwoYears: "marriageOneToTwo",
    notSure: "marriageNotSure",
  }[candidate.marriageTimeline];

  const signals = [`${candidate.city} · ${candidate.country}`, o(religiousnessKey), o(timelineKey)];

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-linear-to-br from-primary-700 to-primary-600">
        <LockIcon size={38} className="text-primary-50/80" />
        <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-[rgba(15,30,25,0.62)] px-2.5 py-1 text-xs text-white backdrop-blur-[2px]">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          {c("protectedTitle")}
        </span>
        <span className="absolute bottom-2.5 start-2.5 end-2.5 text-center text-xs text-white/90">
          {c("protectedHint")}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-bold text-ink">
            {initial} — {candidate.age}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
            <ShieldCheckIcon size={14} />
            {c("verified")}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {signals.map((s) => (
            <span key={s} className="rounded-md bg-primary-50 px-2 py-1 text-xs text-ink-600">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-auto flex gap-2 pt-1">
          <Button size="sm" block disabled aria-disabled title={t("ctaComingSoon")}>
            {c("sendRequest")}
          </Button>
          <Link
            href={`/app/discover/${candidate.uid}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            {c("viewProfile")}
          </Link>
        </div>
      </div>
    </li>
  );
}
