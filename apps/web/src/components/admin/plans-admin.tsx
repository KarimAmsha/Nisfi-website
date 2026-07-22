"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  canGrantEntitlement,
  canManageEntitlements,
  type Entitlement,
  type LocalizedText,
  type Plan,
} from "@nisfi/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/lib/use-admin";
import { usePlans } from "@/lib/use-plans";

function PlanCard({ plan, locale }: { plan: Plan; locale: keyof LocalizedText }) {
  const t = useTranslations("Admin.plans");
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-canvas p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-bold text-ink">{plan.name[locale]}</h3>
        <Badge tone={plan.active ? "success" : "neutral"} dot>
          {plan.active ? t("active") : t("inactive")}
        </Badge>
      </div>
      <p className="text-2xl font-bold text-primary-700">
        {plan.priceMonthly === null ? t("free") : t("perMonth", { price: plan.priceMonthly })}
      </p>
      <dl className="flex flex-col gap-1 text-sm">
        {Object.entries(plan.limits).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-3">
            <dt className="text-ink-600">{key}</dt>
            <dd className="font-semibold text-ink tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function EntitlementManager({ plans }: { plans: Plan[] }) {
  const t = useTranslations("Admin.plans");
  const { role } = useAdmin();
  const { subscriptionsEnabled, lookup, grant } = usePlans();
  const [uid, setUid] = useState("");
  const [result, setResult] = useState<Entitlement | null | "none">("none");
  const [planId, setPlanId] = useState(plans[0]?.id ?? "free");
  const [granted, setGranted] = useState(false);

  const canManage = canManageEntitlements(role);
  const grantCheck = canGrantEntitlement(role, subscriptionsEnabled, planId, plans);

  async function doLookup() {
    setGranted(false);
    setResult(await lookup(uid));
  }

  async function doGrant() {
    if (!grantCheck.ok) return;
    await grant(uid, planId);
    setGranted(true);
    setResult({ plan: planId, grantedAt: new Date().toISOString(), grantedBy: "you" });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-card">
      <h2 className="font-bold text-ink">{t("entitlementTitle")}</h2>

      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{t("memberUid")}</span>
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder={t("memberUidPlaceholder")}
            aria-label={t("memberUid")}
            className={cn(
              "h-11 rounded-md border border-border bg-surface px-3 text-sm text-ink tabular-nums",
              "focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            )}
          />
        </label>
        <Button
          size="sm"
          variant="ghost"
          disabled={uid.trim() === ""}
          onClick={() => void doLookup()}
        >
          {t("lookup")}
        </Button>
      </div>

      {result !== "none" ? (
        result === null ? (
          <p className="rounded-md border border-border bg-canvas px-3 py-2.5 text-sm text-ink-600">
            {t("noEntitlement")}
          </p>
        ) : (
          <dl className="flex flex-col gap-1.5 rounded-md border border-border bg-canvas px-3 py-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600">{t("currentPlan")}</dt>
              <dd className="font-semibold text-ink">{result.plan}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600">{t("grantedAt")}</dt>
              <dd className="text-xs text-ink-600 tabular-nums">{result.grantedAt.slice(0, 10)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink-600">{t("grantedBy")}</dt>
              <dd className="text-xs text-ink-600 tabular-nums">{result.grantedBy ?? "—"}</dd>
            </div>
          </dl>
        )
      ) : null}

      <div className="flex flex-col gap-2 border-t border-border pt-3">
        {canManage ? (
          <>
            <div className="flex items-end gap-2">
              <SelectField
                label={t("grantPlan")}
                className="flex-1"
                value={planId}
                onChange={(e) => setPlanId(e.target.value)}
                options={plans.map((p) => ({ value: p.id, label: p.id }))}
              />
              <Button
                size="sm"
                disabled={!grantCheck.ok || uid.trim() === ""}
                onClick={() => void doGrant()}
              >
                {t("grant")}
              </Button>
            </div>
            {!grantCheck.ok && grantCheck.reason === "subscriptionsEnabled" ? (
              <p className="text-xs text-warning">{t("subscriptionsOnNote")}</p>
            ) : null}
            {granted ? <p className="text-xs text-success">{t("grantedNote")}</p> : null}
          </>
        ) : (
          <p className="text-xs text-ink-600">{t("manageLocked")}</p>
        )}
        <p className="text-xs text-ink-600">{t("auditNote")}</p>
      </div>
    </div>
  );
}

export function PlansAdmin() {
  const t = useTranslations("Admin.plans");
  const locale = useLocale();
  const { plans, subscriptionsEnabled, loading, preview } = usePlans();

  return (
    <div className="flex flex-col gap-5">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border px-4 py-3 text-sm",
          subscriptionsEnabled
            ? "border-warning/30 bg-warning/10 text-warning"
            : "border-info/25 bg-info/10 text-info",
        )}
      >
        <Badge tone={subscriptionsEnabled ? "pending" : "neutral"} dot>
          {subscriptionsEnabled ? t("subsOn") : t("subsOff")}
        </Badge>
        <span>{subscriptionsEnabled ? t("subsOnNote") : t("subsOffNote")}</span>
        {preview ? <Badge tone="info">{t("previewNote")}</Badge> : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-card">
          <h2 className="text-sm font-bold text-ink">{t("catalogTitle")}</h2>
          {loading ? (
            <Skeleton className="h-40 w-full rounded-lg" />
          ) : (
            <div className="flex flex-col gap-3">
              {plans.map((p) => (
                <PlanCard key={p.id} plan={p} locale={locale} />
              ))}
            </div>
          )}
        </section>

        <EntitlementManager plans={plans} />
      </div>
    </div>
  );
}
