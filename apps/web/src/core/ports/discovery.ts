import type {
  DiscoveryCursor,
  DiscoveryFilters,
  DiscoveryPage,
  DiscoveryViewer,
} from "@nisfi/shared";

/**
 * DiscoveryRepository port (master spec Sections 5.2, F4, 10.15). Product code
 * asks for one bounded page of eligible candidates at a time; the adapter owns
 * the deterministic query plan (mandatory eligibility in the Firestore query,
 * bounded batch scan, post-filter of remaining facets) and returns a stable
 * cursor. The exact result-set size is deliberately not exposed — the UI must
 * never show a fabricated total count.
 */
export interface DiscoveryRepository {
  fetchPage(
    viewer: DiscoveryViewer,
    filters: DiscoveryFilters,
    cursor?: DiscoveryCursor | null,
  ): Promise<DiscoveryPage>;
}
