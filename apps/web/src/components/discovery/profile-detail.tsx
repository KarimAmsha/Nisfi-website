"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { computeAge, localized, STARTER_QUESTIONS } from "@nisfi/shared";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { LockIcon, ShieldCheckIcon, CompassIcon } from "@/components/ui/icon";
import { Link } from "@/i18n/navigation";
import { useCandidateProfile } from "@/lib/use-candidate-profile";
import { RequestComposer } from "@/components/discovery/request-composer";

const MARITAL_KEY = {
  single: "maritalSingle",
  divorced: "maritalDivorced",
  widowed: "maritalWidowed",
};
const CHILDREN_KEY = {
  none: "childrenNone",
  have: "childrenHave",
  preferNotToSay: "childrenPrefer",
};
const REL_KEY = {
  practicing: "relPracticing",
  moderate: "relModerate",
  learning: "relLearning",
  preferNotToSay: "relPrefer",
};
const TIMELINE_KEY = {
  withinYear: "marriageWithinYear",
  oneToTwoYears: "marriageOneToTwo",
  notSure: "marriageNotSure",
};
const LANG_KEY = { ar: "langAr", en: "langEn", tr: "langTr" } as const;

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-ink-600">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function ProfileDetail({ uid }: { uid: string }) {
  const t = useTranslations("ProfileDetail");
  const c = useTranslations("Common");
  const f = useTranslations("Onboarding.fields");
  const oRaw = useTranslations("Onboarding.options");
  const o = (key: string) => oRaw(key as Parameters<typeof oRaw>[0]);
  const locale = useLocale();
  const { profile, photoCount, loading, notFound } = useCandidateProfile(uid);
  const [composerOpen, setComposerOpen] = useState(false);

  const backLink = (
    <Link href="/app/discover" className="text-sm font-semibold text-primary-700 hover:underline">
      {t("back")}
    </Link>
  );

  if (loading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {backLink}
        <Skeleton className="aspect-[16/9] w-full" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        {backLink}
        <EmptyState
          icon={<CompassIcon />}
          title={t("unavailableTitle")}
          description={t("unavailableBody")}
          action={
            <Link
              href="/app/discover"
              className="text-sm font-semibold text-primary-700 hover:underline"
            >
              {t("backToDiscover")}
            </Link>
          }
        />
      </div>
    );
  }

  const age = computeAge(profile.birthDate);
  const photos = Math.max(photoCount, 1);
  const answered = STARTER_QUESTIONS.filter((q) => profile.answers?.[q.id]).map((q) => {
    const optionId = profile.answers?.[q.id];
    const option = q.options.find((opt) => opt.id === optionId);
    return {
      id: q.id,
      question: localized(q.text, locale),
      answer: option ? localized(option.label, locale) : "—",
    };
  });

  const facts: { label: string; value: string }[] = [
    { label: f("maritalStatus"), value: o(MARITAL_KEY[profile.maritalStatus]) },
    { label: f("children"), value: o(CHILDREN_KEY[profile.children]) },
    { label: f("religiousness"), value: o(REL_KEY[profile.religiousness]) },
    { label: f("marriageTimeline"), value: o(TIMELINE_KEY[profile.marriageTimeline]) },
    { label: f("languages"), value: profile.languages.map((l) => o(LANG_KEY[l])).join("، ") },
  ];
  if (profile.education) facts.push({ label: f("education"), value: profile.education });
  if (profile.occupation) facts.push({ label: f("occupation"), value: profile.occupation });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {backLink}

      {/* Protected media — placeholders only; originals are never client-reachable. */}
      <div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: photos }, (_, i) => (
            <div
              key={i}
              className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-linear-to-br from-primary-700 to-primary-600"
            >
              <LockIcon size={26} className="text-primary-50/80" />
            </div>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-600">
          <LockIcon size={13} />
          {t("photosNote")}
        </p>
      </div>

      {/* Identity header */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          {profile.displayName} — {age}
        </h2>
        <Badge tone="success" dot>
          <ShieldCheckIcon size={13} />
          {c("verified")}
        </Badge>
        <span className="text-sm text-ink-600">
          {profile.city} · {profile.country}
        </span>
      </div>

      {profile.about ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("aboutTitle")}</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="text-sm leading-relaxed text-ink-600">{profile.about}</p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("detailsTitle")}</CardTitle>
        </CardHeader>
        <CardBody>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {facts.map((fact) => (
              <Fact key={fact.label} label={fact.label} value={fact.value} />
            ))}
          </dl>
        </CardBody>
      </Card>

      {answered.length ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("compatibilityTitle")}</CardTitle>
          </CardHeader>
          <CardBody>
            <dl className="flex flex-col gap-3">
              {answered.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3">
                  <dt className="text-sm text-ink-600">{a.question}</dt>
                  <dd className="text-sm font-semibold text-ink">{a.answer}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      ) : null}

      {/* Connection request — a written request; server enforces limits (CF6). */}
      <div className="sticky bottom-4 flex flex-col gap-2 rounded-lg border border-border bg-surface/95 p-4 shadow-card backdrop-blur">
        <Button block onClick={() => setComposerOpen(true)}>
          {c("sendRequest")}
        </Button>
        <p className="text-center text-xs text-ink-600">{t("requestNote")}</p>
      </div>

      {composerOpen ? (
        <RequestComposer
          recipientUid={uid}
          recipientName={profile.displayName}
          onClose={() => setComposerOpen(false)}
        />
      ) : null}
    </div>
  );
}
