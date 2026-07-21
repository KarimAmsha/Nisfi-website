import { describe, expect, it } from "vitest";
import {
  computeAge,
  isEligibleCandidate,
  matchesFilters,
  selectDiscoveryPage,
  discoveryFiltersSchema,
  type DiscoveryCandidate,
  type DiscoveryFilters,
  type DiscoveryViewer,
} from "./discovery";

/** A verified, active, visible female candidate with sane defaults; override
 * per test. Timestamps ascend with the numeric suffix so sort order is
 * predictable across the seed set. */
function candidate(uid: string, over: Partial<DiscoveryCandidate> = {}): DiscoveryCandidate {
  const n = Number(uid.replace(/\D/g, "")) || 1;
  const stamp = `2026-01-${String(n).padStart(2, "0")}T00:00:00.000Z`;
  return {
    uid,
    gender: "female",
    age: 27,
    country: "TR",
    city: "Istanbul",
    languages: ["ar", "en"],
    maritalStatus: "single",
    children: "none",
    religiousness: "practicing",
    marriageTimeline: "withinYear",
    verified: true,
    active: true,
    visible: true,
    createdAt: stamp,
    lastActiveAt: stamp,
    ...over,
  };
}

const viewer: DiscoveryViewer = {
  uid: "omar",
  gender: "male",
  blockedUids: [],
  matchedUids: [],
};

const defaults = discoveryFiltersSchema.parse({});

describe("computeAge", () => {
  it("counts whole years, not-yet-had birthday this year", () => {
    const now = new Date("2026-05-01T00:00:00Z");
    expect(computeAge("1996-04-30", now)).toBe(30);
    expect(computeAge("1996-05-01", now)).toBe(30);
    expect(computeAge("1996-05-02", now)).toBe(29);
  });
});

describe("isEligibleCandidate — mandatory exclusions (F4)", () => {
  it("accepts an opposite-gender verified active visible candidate", () => {
    expect(isEligibleCandidate(viewer, candidate("u1"))).toBe(true);
  });

  it("excludes same gender", () => {
    expect(isEligibleCandidate(viewer, candidate("u1", { gender: "male" }))).toBe(false);
  });

  it("excludes self", () => {
    expect(isEligibleCandidate(viewer, candidate("omar", { gender: "female" }))).toBe(false);
  });

  it("excludes hidden, unverified, or inactive", () => {
    expect(isEligibleCandidate(viewer, candidate("u1", { visible: false }))).toBe(false);
    expect(isEligibleCandidate(viewer, candidate("u1", { verified: false }))).toBe(false);
    expect(isEligibleCandidate(viewer, candidate("u1", { active: false }))).toBe(false);
  });

  it("excludes blocked (either direction, via the pre-unioned set) and matched", () => {
    const blocked: DiscoveryViewer = { ...viewer, blockedUids: ["u1"] };
    expect(isEligibleCandidate(blocked, candidate("u1"))).toBe(false);
    const matched: DiscoveryViewer = { ...viewer, matchedUids: ["u2"] };
    expect(isEligibleCandidate(matched, candidate("u2"))).toBe(false);
  });
});

describe("matchesFilters — optional facets", () => {
  const c = candidate("u1", { age: 28, country: "TR", city: "Istanbul", languages: ["tr"] });

  it("passes when no facet is set", () => {
    expect(matchesFilters(c, defaults)).toBe(true);
  });

  it("applies age range inclusively", () => {
    expect(matchesFilters(c, { ...defaults, minAge: 28, maxAge: 28 })).toBe(true);
    expect(matchesFilters(c, { ...defaults, minAge: 29 })).toBe(false);
    expect(matchesFilters(c, { ...defaults, maxAge: 27 })).toBe(false);
  });

  it("treats multi-selects disjunctively and city as a substring", () => {
    expect(matchesFilters(c, { ...defaults, countries: ["SA", "TR"] })).toBe(true);
    expect(matchesFilters(c, { ...defaults, countries: ["SA"] })).toBe(false);
    expect(matchesFilters(c, { ...defaults, city: "istan" })).toBe(true);
    expect(matchesFilters(c, { ...defaults, languages: ["ar", "tr"] })).toBe(true);
    expect(matchesFilters(c, { ...defaults, languages: ["ar"] })).toBe(false);
  });
});

describe("selectDiscoveryPage — exclusion + pagination with seeded users", () => {
  // Ten seeded members: a spread of eligible and excluded cases.
  const seed: DiscoveryCandidate[] = [
    candidate("u1"),
    candidate("u2", { gender: "male" }), // excluded: same gender
    candidate("u3", { visible: false }), // excluded: hidden
    candidate("u4", { verified: false }), // excluded: unverified
    candidate("u5", { active: false }), // excluded: inactive
    candidate("u6"),
    candidate("u7"),
    candidate("u8", { country: "SA" }),
    candidate("u9"),
    candidate("u10"),
  ];
  const eligibleUids = ["u1", "u6", "u7", "u8", "u9", "u10"]; // 6 eligible

  it("returns only eligible candidates, newest first, and paginates via the cursor", () => {
    const page1 = selectDiscoveryPage(seed, viewer, defaults, { pageSize: 4 });
    expect(page1.items.map((c) => c.uid)).toEqual(["u10", "u9", "u8", "u7"]);
    expect(page1.exhausted).toBe(false);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = selectDiscoveryPage(seed, viewer, defaults, {
      pageSize: 4,
      cursor: page1.nextCursor,
    });
    expect(page2.items.map((c) => c.uid)).toEqual(["u6", "u1"]);
    expect(page2.exhausted).toBe(true);
    expect(page2.nextCursor).toBeNull();

    // No overlap and full coverage across pages.
    const seen = [...page1.items, ...page2.items].map((c) => c.uid);
    expect(new Set(seen).size).toBe(seen.length);
    expect(new Set(seen)).toEqual(new Set(eligibleUids));
  });

  it("excludes blocked and matched members from the feed", () => {
    const v: DiscoveryViewer = { ...viewer, blockedUids: ["u10"], matchedUids: ["u9"] };
    const page = selectDiscoveryPage(seed, v, defaults, { pageSize: 10 });
    expect(page.items.map((c) => c.uid)).not.toContain("u10");
    expect(page.items.map((c) => c.uid)).not.toContain("u9");
    expect(page.items).toHaveLength(4);
  });

  it("applies facet filters on top of eligibility", () => {
    const page = selectDiscoveryPage(
      seed,
      viewer,
      { ...defaults, countries: ["SA"] },
      {
        pageSize: 10,
      },
    );
    expect(page.items.map((c) => c.uid)).toEqual(["u8"]);
  });

  it("sorts by recent activity when requested", () => {
    const custom = [
      candidate("a1", {
        createdAt: "2026-01-01T00:00:00.000Z",
        lastActiveAt: "2026-03-09T00:00:00.000Z",
      }),
      candidate("a2", {
        createdAt: "2026-01-02T00:00:00.000Z",
        lastActiveAt: "2026-03-01T00:00:00.000Z",
      }),
    ];
    const byNew = selectDiscoveryPage(custom, viewer, defaults, { pageSize: 10 });
    expect(byNew.items.map((c) => c.uid)).toEqual(["a2", "a1"]);
    const byActive = selectDiscoveryPage(
      custom,
      viewer,
      { ...defaults, sort: "recentlyActive" },
      { pageSize: 10 },
    );
    expect(byActive.items.map((c) => c.uid)).toEqual(["a1", "a2"]);
  });

  it("honours the scan cap without implying the result set is exhausted", () => {
    const page = selectDiscoveryPage(seed, viewer, defaults, { pageSize: 10, scanCap: 3 });
    expect(page.scanned).toBe(3); // inspected u10, u9, u8 then stopped
    expect(page.exhausted).toBe(false); // capped — more may exist
    expect(page.nextCursor).not.toBeNull();
  });

  it("reports exhaustion and a null cursor when the whole stream is scanned", () => {
    const page = selectDiscoveryPage(seed, viewer, defaults, { pageSize: 10 });
    expect(page.items).toHaveLength(eligibleUids.length);
    expect(page.exhausted).toBe(true);
    expect(page.nextCursor).toBeNull();
  });
});

describe("discoveryFiltersSchema", () => {
  it("defaults sort to newest and rejects out-of-range ages", () => {
    expect(defaults.sort).toBe("newest");
    expect(discoveryFiltersSchema.safeParse({ minAge: 17 }).success).toBe(false);
    const ok = discoveryFiltersSchema.safeParse({
      minAge: 25,
      maxAge: 35,
      countries: ["TR"],
      sort: "recentlyActive",
    } satisfies Partial<DiscoveryFilters>);
    expect(ok.success).toBe(true);
  });
});
