"use client";

import { useEffect, useState } from "react";
import type { AccountStatus } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { accountRepository } from "@/infrastructure/firebase/account.repository";

/**
 * The signed-in member's account status, read from their own `users` document.
 * In preview (Firebase unconfigured) it reports `active` so the shells stay
 * viewable. `loading` is true until the first read resolves so the access gate
 * doesn't flash content before it can route a locked-out member.
 */
export function useAccountStatus(): { status: AccountStatus; loading: boolean } {
  const { configured, user } = useAuth();
  const [status, setStatus] = useState<AccountStatus>("active");
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setStatus("active");
      setLoading(false);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    accountRepository
      .getStatus(user.uid)
      .then((next) => active && setStatus(next))
      .catch(() => active && setStatus("active"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [configured, user]);

  return { status, loading };
}
