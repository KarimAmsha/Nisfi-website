import { z } from "zod";
import { LOCALES, type Locale } from "./locale";
import {
  CHILDREN_STATUSES,
  MARITAL_STATUSES,
  MARRIAGE_TIMELINES,
  RELIGIOUSNESS,
  type ChildrenStatus,
  type Gender,
  type MaritalStatus,
  type MarriageTimeline,
  type Religiousness,
} from "./profile";

/**
 * Discovery query model (master spec Section F4 and 10.15). This module is the
 * backend-agnostic core of Unit 3.1: the eligibility/exclusion predicate, the
 * persisted filter shape, and a deterministic page-selection function whose
 * pagination and exclusion behaviour is demonstrated with seeded users in the
 * unit tests. The Firestore `DiscoveryRepository` adapter builds on this same
 * pure logic to post-filter scanned batches; no Firestore SDK types appear here.
 */

/** Sort orders offered on the discovery feed (Section F4). */
export const DISCOVERY_SORTS = ["newest", "recentlyActive"] as const;
export type DiscoverySort = (typeof DISCOVERY_SORTS)[number];

/**
 * The eligibility/query-relevant projection of a member surfaced to discovery.
 * `age`, `verified`, `active`, and `lastActiveAt` are server-canonical values
 * maintained by Cloud Functions (never client-written); the client only reads
 * them. This is deliberately a subset of `PublicProfile` — no sensitive fields.
 */
export interface DiscoveryCandidate {
  uid: string;
  gender: Gender;
  /** Whole years, computed server-side from `birthDate`. */
  age: number;
  country: string;
  city: string;
  languages: readonly Locale[];
  maritalStatus: MaritalStatus;
  children: ChildrenStatus;
  religiousness: Religiousness;
  marriageTimeline: MarriageTimeline;
  answers?: Record<string, string>;
  /** `verification.status == "verified"`. */
  verified: boolean;
  /** Account `status == "active"`. */
  active: boolean;
  /** `visibility == "visible"`. */
  visible: boolean;
  /** ISO timestamp — the `newest` sort key. */
  createdAt: string;
  /** ISO timestamp — the `recentlyActive` sort key. */
  lastActiveAt: string;
}

/**
 * The viewer's context and exclusion sets. `blockedUids` must already be the
 * union of both block directions (blocked-by and blocking); `matchedUids` are
 * members the viewer is already matched with. The caller assembles these once
 * per session so the predicate stays pure.
 */
export interface DiscoveryViewer {
  uid: string;
  gender: Gender;
  blockedUids: readonly string[];
  matchedUids: readonly string[];
}

/**
 * Mandatory eligibility constraints (Section F4): a candidate appears only if
 * it is the opposite gender, visible, verified, on an active account, not the
 * viewer, not blocked in either direction, and not already matched. These are
 * non-negotiable and are never relaxed by filters.
 */
export function isEligibleCandidate(
  viewer: DiscoveryViewer,
  candidate: DiscoveryCandidate,
): boolean {
  if (candidate.uid === viewer.uid) return false;
  if (candidate.gender === viewer.gender) return false;
  if (!candidate.visible || !candidate.verified || !candidate.active) return false;
  if (viewer.blockedUids.includes(candidate.uid)) return false;
  if (viewer.matchedUids.includes(candidate.uid)) return false;
  return true;
}

/** Persisted discovery filters (Section F4), all optional. Stored per user in
 * `users.settings.discoveryFilters`. Eligibility is enforced separately and is
 * never expressed here. */
export const discoveryFiltersSchema = z.object({
  minAge: z.number().int().min(18).max(99).optional(),
  maxAge: z.number().int().min(18).max(99).optional(),
  countries: z.array(z.string().trim().min(2).max(56)).max(20).optional(),
  city: z.string().trim().min(1).max(85).optional(),
  languages: z.array(z.enum(LOCALES)).max(LOCALES.length).optional(),
  maritalStatuses: z.array(z.enum(MARITAL_STATUSES)).max(MARITAL_STATUSES.length).optional(),
  children: z.array(z.enum(CHILDREN_STATUSES)).max(CHILDREN_STATUSES.length).optional(),
  religiousness: z.array(z.enum(RELIGIOUSNESS)).max(RELIGIOUSNESS.length).optional(),
  marriageTimelines: z.array(z.enum(MARRIAGE_TIMELINES)).max(MARRIAGE_TIMELINES.length).optional(),
  sort: z.enum(DISCOVERY_SORTS).default("newest"),
});
export type DiscoveryFilters = z.infer<typeof discoveryFiltersSchema>;

/** Whole years between `birthDate` (YYYY-MM-DD) and `now`. Server-canonical
 * `age` is computed with this so the client and Functions agree. */
export function computeAge(birthDate: string, now: Date = new Date()): number {
  const born = new Date(`${birthDate}T00:00:00Z`);
  let age = now.getUTCFullYear() - born.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - born.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < born.getUTCDate())) {
    age -= 1;
  }
  return age;
}

/** Optional facet filters (Section F4). Multi-selects are disjunctive (any of);
 * `city` is a case-insensitive substring. An unset facet does not constrain. */
export function matchesFilters(candidate: DiscoveryCandidate, filters: DiscoveryFilters): boolean {
  if (filters.minAge !== undefined && candidate.age < filters.minAge) return false;
  if (filters.maxAge !== undefined && candidate.age > filters.maxAge) return false;
  if (filters.countries?.length && !filters.countries.includes(candidate.country)) return false;
  if (filters.city && !candidate.city.toLowerCase().includes(filters.city.toLowerCase())) {
    return false;
  }
  if (
    filters.languages?.length &&
    !filters.languages.some((l) => candidate.languages.includes(l))
  ) {
    return false;
  }
  if (
    filters.maritalStatuses?.length &&
    !filters.maritalStatuses.includes(candidate.maritalStatus)
  ) {
    return false;
  }
  if (filters.children?.length && !filters.children.includes(candidate.children)) return false;
  if (filters.religiousness?.length && !filters.religiousness.includes(candidate.religiousness)) {
    return false;
  }
  if (
    filters.marriageTimelines?.length &&
    !filters.marriageTimelines.includes(candidate.marriageTimeline)
  ) {
    return false;
  }
  return true;
}

/** Total order used for stable pagination: sort key descending, then uid
 * ascending as a deterministic tiebreak. */
function sortKey(candidate: DiscoveryCandidate, sort: DiscoverySort): string {
  return sort === "recentlyActive" ? candidate.lastActiveAt : candidate.createdAt;
}

function compareForSort(a: DiscoveryCandidate, b: DiscoveryCandidate, sort: DiscoverySort): number {
  const ka = sortKey(a, sort);
  const kb = sortKey(b, sort);
  if (ka !== kb) return ka < kb ? 1 : -1; // descending
  return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0; // ascending tiebreak
}

/** An opaque, stable cursor: the sort key and uid of the last emitted item. A
 * later page resumes strictly after this position, so inserts elsewhere in the
 * stream never shift or duplicate results. */
export interface DiscoveryCursor {
  key: string;
  uid: string;
}

function isAfterCursor(
  candidate: DiscoveryCandidate,
  cursor: DiscoveryCursor,
  sort: DiscoverySort,
): boolean {
  const key = sortKey(candidate, sort);
  if (key !== cursor.key) return key < cursor.key; // strictly later in descending order
  return candidate.uid > cursor.uid; // same key: strictly after by uid
}

export interface DiscoveryPage {
  items: DiscoveryCandidate[];
  /** Resume token for the next page, or `null` when the scan was exhausted. */
  nextCursor: DiscoveryCursor | null;
  /** How many candidates were inspected to fill this page (read-cost signal). */
  scanned: number;
  /** True only when the whole input was scanned — i.e. there is definitively
   * nothing after this page. Never implies an exact total count. */
  exhausted: boolean;
}

export interface SelectPageOptions {
  pageSize: number;
  cursor?: DiscoveryCursor | null;
  /** Upper bound on candidates inspected in one call (Section 10.15 read cap).
   * Defaults to no cap beyond the input length. */
  scanCap?: number;
}

/**
 * Deterministic page selection over an already-fetched candidate stream — the
 * post-filter half of the Section 10.15 query plan. Applies eligibility and
 * facet filters, orders by the requested sort, resumes after `cursor`, and
 * emits up to `pageSize` items or until `scanCap` candidates were inspected.
 * `exhausted` is true only when the entire input was scanned, so the UI can
 * distinguish "definitely the end" from "capped — more may exist" without ever
 * fabricating an exact count.
 */
export function selectDiscoveryPage(
  candidates: readonly DiscoveryCandidate[],
  viewer: DiscoveryViewer,
  filters: DiscoveryFilters,
  options: SelectPageOptions,
): DiscoveryPage {
  const sort = filters.sort;
  const ordered = [...candidates].sort((a, b) => compareForSort(a, b, sort));

  const items: DiscoveryCandidate[] = [];
  let scanned = 0;
  let index = 0;
  const cap = options.scanCap ?? Number.POSITIVE_INFINITY;

  for (; index < ordered.length; index += 1) {
    if (items.length >= options.pageSize || scanned >= cap) break;
    const candidate = ordered[index];
    if (candidate === undefined) continue;
    if (options.cursor && !isAfterCursor(candidate, options.cursor, sort)) continue;
    scanned += 1;
    if (!isEligibleCandidate(viewer, candidate)) continue;
    if (!matchesFilters(candidate, filters)) continue;
    items.push(candidate);
  }

  const exhausted = index >= ordered.length && scanned < cap;
  const last = items.at(-1);
  const nextCursor = !exhausted && last ? { key: sortKey(last, sort), uid: last.uid } : null;

  return { items, nextCursor, scanned, exhausted };
}
