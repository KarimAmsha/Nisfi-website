"use client";

import { useCallback, useEffect, useState } from "react";
import { FREE_PLAN, type Entitlement, type Plan } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { useAppConfig } from "@/lib/use-app-config";
import { planRepository } from "@/infrastructure/firebase/plan.repository";

const PREVIEW_PLANS: Plan[] = [FREE_PLAN];

const PREVIEW_ENTITLEMENTS: Record<string, Entitlement> = {
  uid_9f3a12: { plan: "free", grantedAt: "2026-02-11T09:20:00.000Z", grantedBy: null },
  uid_2b7c88: { plan: "free", grantedAt: "2026-01-30T14:00:00.000Z", grantedBy: "system" },
};

export interface UsePlansResult {
  plans: Plan[];
  subscriptionsEnabled: boolean;
  loading: boolean;
  error: boolean;
  preview: boolean;
  lookup: (uid: string) => Promise<Entitlement | null>;
  grant: (uid: string, planId: string) => Promise<void>;
}

export function usePlans(): UsePlansResult {
  const { configured, user } = useAuth();
  const { config } = useAppConfig();
  const [plans, setPlans] = useState<Plan[]>(PREVIEW_PLANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setPlans(PREVIEW_PLANS);
      setLoading(false);
      return;
    }
    if (!user) {
      setPlans([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    planRepository
      .listPlans()
      .then((p) => setPlans(p.length > 0 ? p : PREVIEW_PLANS))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  const lookup = useCallback(
    async (uid: string) => {
      if (!configured) return PREVIEW_ENTITLEMENTS[uid.trim()] ?? null;
      return planRepository.getEntitlement(uid.trim());
    },
    [configured],
  );

  const grant = useCallback(
    async (uid: string, planId: string) => {
      if (configured) await planRepository.grantEntitlement(uid.trim(), planId);
    },
    [configured],
  );

  return {
    plans,
    subscriptionsEnabled: config.flags.subscriptionsEnabled,
    loading,
    error,
    preview: !configured,
    lookup,
    grant,
  };
}
