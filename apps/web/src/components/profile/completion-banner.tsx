"use client";

import { useTranslations } from "next-intl";
import { computeProfileCompletion } from "@nisfi/shared";
import { Link } from "@/i18n/navigation";
import { SparkIcon } from "@/components/ui/icon";
import { useOwnProfile } from "@/lib/use-own-profile";

/** Gentle nudge shown across member pages while the profile is incomplete.
 * Renders nothing while loading, when there is no profile yet, or once the
 * profile reaches full completion. */
export function ProfileCompletionBanner() {
  const t = useTranslations("Me");
  const { profile, loading } = useOwnProfile();

  if (loading || !profile) return null;
  const completion = computeProfileCompletion(profile);
  if (completion >= 100) return null;

  return (
    <div role="note" className="border-b border-accent/30 bg-accent/10">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 text-sm">
        <SparkIcon size={18} className="shrink-0 text-accent" />
        <p className="min-w-0 flex-1 text-ink-600">{t("bannerText", { completion })}</p>
        <Link
          href="/onboarding"
          className="shrink-0 font-semibold text-primary-700 underline-offset-2 hover:underline"
        >
          {t("completeCta")}
        </Link>
      </div>
    </div>
  );
}
