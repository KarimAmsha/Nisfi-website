import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type DocumentData,
  type Query,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import {
  selectDiscoveryPage,
  type DiscoveryCandidate,
  type DiscoveryCursor,
  type DiscoveryFilters,
  type DiscoveryPage,
  type DiscoveryViewer,
  type Gender,
  type Locale,
} from "@nisfi/shared";
import type { DiscoveryRepository } from "@/core/ports/discovery";
import { firebaseFirestore } from "./client";
import { isFirebaseConfigured } from "./env";

/**
 * Firestore DiscoveryRepository — the deterministic query plan of master spec
 * Section 10.15. The **mandatory, high-selectivity** eligibility constraints
 * (opposite gender, `verification.status == "verified"`, `visibility ==
 * "visible"`) plus the sort are pushed into an indexed Firestore query (see the
 * `profiles` composite indexes in `firestore.indexes.json`). We then scan
 * successive **bounded batches**, map each doc to a domain `DiscoveryCandidate`,
 * and hand the batch to the shared {@link selectDiscoveryPage} to post-filter
 * the remaining facets and the per-viewer exclusions (blocks/matches) that
 * cannot be expressed in a single index. Scanning continues until a display
 * page is filled or the read cap is reached — never post-filtering only the
 * first batch and implying completeness.
 *
 * The server-canonical candidate fields (`age`, `verification.status`,
 * `lastActiveAt`, mirrored `active`) are maintained by Cloud Functions; the
 * client only reads them. Real project data + those Functions are connected in
 * the deferred production-wiring step (O-001), so in preview this returns an
 * empty page rather than guessing.
 */

const BATCH_SIZE = 40;
const READ_CAP = 200;

function oppositeGender(gender: Gender): Gender {
  return gender === "male" ? "female" : "male";
}

function sortField(filters: DiscoveryFilters): "createdAt" | "lastActiveAt" {
  return filters.sort === "recentlyActive" ? "lastActiveAt" : "createdAt";
}

function toCandidate(snap: QueryDocumentSnapshot<DocumentData>): DiscoveryCandidate {
  const data = snap.data();
  const verification = (data.verification ?? {}) as { status?: string };
  return {
    uid: snap.id,
    gender: data.gender as Gender,
    age: (data.age as number | undefined) ?? 0,
    country: (data.country as string | undefined) ?? "",
    city: (data.city as string | undefined) ?? "",
    languages: (data.languages as Locale[] | undefined) ?? [],
    maritalStatus: data.maritalStatus as DiscoveryCandidate["maritalStatus"],
    children: data.children as DiscoveryCandidate["children"],
    religiousness: data.religiousness as DiscoveryCandidate["religiousness"],
    marriageTimeline: data.marriageTimeline as DiscoveryCandidate["marriageTimeline"],
    answers: (data.answers as Record<string, string> | undefined) ?? {},
    verified: verification.status === "verified",
    active: data.active !== false,
    visible: (data.visibility as string | undefined) === "visible",
    createdAt: (data.createdAt as string | undefined) ?? "",
    lastActiveAt: (data.lastActiveAt as string | undefined) ?? "",
  };
}

class FirestoreDiscoveryRepository implements DiscoveryRepository {
  async fetchPage(
    viewer: DiscoveryViewer,
    filters: DiscoveryFilters,
    cursor?: DiscoveryCursor | null,
  ): Promise<DiscoveryPage> {
    if (!isFirebaseConfigured()) {
      return { items: [], nextCursor: null, scanned: 0, exhausted: true };
    }

    const field = sortField(filters);
    const base = collection(firebaseFirestore(), "profiles");
    const constraints = [
      where("gender", "==", oppositeGender(viewer.gender)),
      where("verification.status", "==", "verified"),
      where("visibility", "==", "visible"),
      orderBy(field, "desc"),
    ];

    // Scan bounded batches, post-filtering each with the shared query plan until
    // the page is filled, the read cap is hit, or the stream is exhausted.
    const collected: DiscoveryCandidate[] = [];
    let cursorValue: string | undefined;
    let scanned = 0;
    let exhausted = false;

    while (collected.length < BATCH_SIZE && scanned < READ_CAP) {
      let q: Query<DocumentData> = query(base, ...constraints, limit(BATCH_SIZE));
      if (cursorValue !== undefined)
        q = query(base, ...constraints, startAfter(cursorValue), limit(BATCH_SIZE));
      const snap = await getDocs(q);
      if (snap.empty) {
        exhausted = true;
        break;
      }
      scanned += snap.size;
      const batch = snap.docs.map(toCandidate);
      collected.push(...batch);
      const lastDoc = snap.docs.at(-1);
      cursorValue = lastDoc ? (lastDoc.data()[field] as string) : undefined;
      if (snap.size < BATCH_SIZE) {
        exhausted = true;
        break;
      }
    }

    // Enforce per-viewer exclusions + facet filters + a stable page over the
    // scanned candidates. `selectDiscoveryPage` already respects the cursor
    // shape, so we thread the incoming cursor through.
    const page = selectDiscoveryPage(collected, viewer, filters, {
      pageSize: BATCH_SIZE,
      cursor: cursor ?? null,
      scanCap: READ_CAP,
    });
    return { ...page, scanned, exhausted: exhausted && page.exhausted };
  }
}

export const discoveryRepository: DiscoveryRepository = new FirestoreDiscoveryRepository();
