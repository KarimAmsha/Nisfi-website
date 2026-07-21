"use client";

import { useTranslations } from "next-intl";
import { computeProfileCompletion } from "@nisfi/shared";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { PhotoManager } from "@/components/photos/photo-manager";
import { useOwnProfile } from "@/lib/use-own-profile";

export function ProfileOverview() {
  const t = useTranslations("Me");
  const { profile, loading } = useOwnProfile();
  const completion = computeProfileCompletion(profile ?? {});

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between gap-3">
          <CardTitle>{t("title")}</CardTitle>
          <Link href="/onboarding" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {profile ? t("editCta") : t("completeCta")}
          </Link>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              {profile ? (
                <div>
                  <p className="text-lg font-bold text-ink">{profile.displayName}</p>
                  <p className="text-sm text-ink-600">
                    {[profile.city, profile.country].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-ink-600">{t("notSet")}</p>
              )}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-600">{t("completionLabel")}</span>
                  <span className="font-semibold text-ink tabular-nums">{completion}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
      <PhotoManager />
    </div>
  );
}
