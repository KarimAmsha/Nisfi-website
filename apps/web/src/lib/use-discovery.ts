"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  selectDiscoveryPage,
  type DiscoveryCandidate,
  type DiscoveryCursor,
  type DiscoveryFilters,
  type DiscoveryViewer,
} from "@nisfi/shared";
import { useAuth } from "@/lib/auth-context";
import { useOwnProfile } from "@/lib/use-own-profile";
import { discoveryRepository } from "@/infrastructure/firebase/discovery.repository";
import { PREVIEW_CANDIDATES, PREVIEW_VIEWER } from "@/lib/discovery-preview";

const PAGE_SIZE = 6;

export interface UseDiscoveryResult {
  items: DiscoveryCandidate[];
  loading: boolean;
  loadingMore: boolean;
  error: boolean;
  hasMore: boolean;
  /** True in preview (no backend) — the list is demo data. */
  preview: boolean;
  loadMore: () => void;
  reload: () => void;
}

/**
 * Loads discovery pages for the current filters via the `DiscoveryRepository`
 * port, accumulating results and threading the stable cursor. When Firebase is
 * unconfigured it runs the preview seed through the same `selectDiscoveryPage`
 * logic, so filters and pagination behave identically to production.
 */
export function useDiscovery(filters: DiscoveryFilters): UseDiscoveryResult {
  const { configured, user } = useAuth();
  const { profile } = useOwnProfile();

  const viewer = useMemo<DiscoveryViewer | null>(() => {
    if (!configured) return PREVIEW_VIEWER;
    if (!user || !profile) return null;
    // Block/match exclusion sets are wired with their features (Units 3.6/4.x);
    // until then the mandatory eligibility still applies.
    return { uid: user.uid, gender: profile.gender, blockedUids: [], matchedUids: [] };
  }, [configured, user, profile]);

  const [items, setItems] = useState<DiscoveryCandidate[]>([]);
  const [cursor, setCursor] = useState<DiscoveryCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const reqId = useRef(0);

  const fetchPage = useCallback(
    async (from: DiscoveryCursor | null) => {
      if (!viewer) {
        return { items: [] as DiscoveryCandidate[], nextCursor: null, hasMore: false };
      }
      if (!configured) {
        const page = selectDiscoveryPage(PREVIEW_CANDIDATES, viewer, filters, {
          pageSize: PAGE_SIZE,
          cursor: from,
        });
        return { items: page.items, nextCursor: page.nextCursor, hasMore: !page.exhausted };
      }
      const page = await discoveryRepository.fetchPage(viewer, filters, from);
      return { items: page.items, nextCursor: page.nextCursor, hasMore: !page.exhausted };
    },
    [viewer, configured, filters],
  );

  const run = useCallback(
    (from: DiscoveryCursor | null) => {
      const id = ++reqId.current;
      const first = from === null;
      if (first) setLoading(true);
      else setLoadingMore(true);
      setError(false);
      void fetchPage(from)
        .then((res) => {
          if (id !== reqId.current) return;
          setItems((prev) => (first ? res.items : [...prev, ...res.items]));
          setCursor(res.nextCursor);
          setHasMore(res.hasMore);
        })
        .catch(() => {
          if (id !== reqId.current) return;
          setError(true);
        })
        .finally(() => {
          if (id !== reqId.current) return;
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [fetchPage],
  );

  // Reset and reload whenever the filters (or viewer) change.
  useEffect(() => {
    run(null);
  }, [run]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    run(cursor);
  }, [run, cursor, hasMore, loading, loadingMore]);

  const reload = useCallback(() => run(null), [run]);

  return {
    items,
    loading: loading && Boolean(viewer),
    loadingMore,
    error,
    hasMore,
    preview: !configured,
    loadMore,
    reload,
  };
}
