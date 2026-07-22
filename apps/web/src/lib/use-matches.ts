"use client";

import { useCallback, useEffect, useState } from "react";
import type { Match } from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { matchRepository } from "@/infrastructure/firebase/match.repository";
import { PREVIEW_MATCHES } from "@/lib/matches-preview";

export interface UseMatchesResult {
  matches: Match[];
  loading: boolean;
  error: boolean;
  preview: boolean;
  reload: () => void;
}

export function useMatches(): UseMatchesResult {
  const { configured, user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    if (!configured) {
      setMatches(PREVIEW_MATCHES);
      setLoading(false);
      return;
    }
    if (!user) {
      setMatches([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    matchRepository
      .listMatches(user.uid)
      .then(setMatches)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [configured, user]);

  useEffect(load, [load]);

  return { matches, loading, error, preview: !configured, reload: load };
}
