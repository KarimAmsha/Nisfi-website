"use client";

import { useEffect, useState } from "react";
import type { Role } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { adminRepository } from "@/infrastructure/firebase/admin.repository";
import type { AdminQueueCounts } from "@/core/ports/admin";

const PREVIEW_COUNTS: AdminQueueCounts = {
  pendingVerifications: 12,
  pendingPhotos: 5,
  openReports: 3,
};

export interface UseAdminResult {
  role: Role;
  counts: AdminQueueCounts;
  loading: boolean;
  error: boolean;
  preview: boolean;
}

/** Staff role + operational queue counts for the console. In preview (no auth)
 * it shows a demo admin with seeded counts so the console is navigable. */
export function useAdmin(): UseAdminResult {
  const { configured, user } = useAuth();
  // In preview there is no signed-in staff; assume `superAdmin` so the whole
  // console — including role assignment and bans — is walkable (owner review).
  const role: Role = configured ? (user?.role ?? "user") : "superAdmin";
  const [counts, setCounts] = useState<AdminQueueCounts>(PREVIEW_COUNTS);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!configured) {
      setCounts(PREVIEW_COUNTS);
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(false);
    adminRepository
      .getQueueCounts()
      .then((c) => active && setCounts(c))
      .catch(() => active && setError(true))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [configured, user]);

  return { role, counts, loading, error, preview: !configured };
}
