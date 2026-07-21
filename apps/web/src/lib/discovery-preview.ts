import type { DiscoveryCandidate, DiscoveryViewer } from "@nisfi/shared";

/**
 * Preview-only seed used when Firebase is unconfigured, so the discovery surface
 * (cards, filters, pagination) is genuinely demonstrable. These run through the
 * same `selectDiscoveryPage` logic as production — only the data source differs.
 * Real candidates come from the `DiscoveryRepository` once wired (O-001).
 */
function seedCandidate(
  uid: string,
  over: Partial<DiscoveryCandidate>,
): DiscoveryCandidate {
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
    createdAt: "2026-01-01T00:00:00.000Z",
    lastActiveAt: "2026-01-01T00:00:00.000Z",
    ...over,
  };
}

export const PREVIEW_VIEWER: DiscoveryViewer = {
  uid: "preview-viewer",
  gender: "male",
  blockedUids: [],
  matchedUids: [],
};

export const PREVIEW_CANDIDATES: DiscoveryCandidate[] = [
  seedCandidate("p1", {
    age: 29,
    city: "Istanbul",
    country: "TR",
    languages: ["ar", "tr"],
    createdAt: "2026-03-10T00:00:00.000Z",
    lastActiveAt: "2026-03-18T00:00:00.000Z",
  }),
  seedCandidate("p2", {
    age: 33,
    city: "Riyadh",
    country: "SA",
    religiousness: "moderate",
    maritalStatus: "divorced",
    children: "have",
    marriageTimeline: "oneToTwoYears",
    createdAt: "2026-03-08T00:00:00.000Z",
    lastActiveAt: "2026-03-19T00:00:00.000Z",
  }),
  seedCandidate("p3", {
    age: 26,
    city: "Amman",
    country: "JO",
    languages: ["ar", "en"],
    createdAt: "2026-03-12T00:00:00.000Z",
    lastActiveAt: "2026-03-14T00:00:00.000Z",
  }),
  seedCandidate("p4", {
    age: 31,
    city: "Ankara",
    country: "TR",
    languages: ["tr"],
    religiousness: "learning",
    createdAt: "2026-03-05T00:00:00.000Z",
    lastActiveAt: "2026-03-17T00:00:00.000Z",
  }),
  seedCandidate("p5", {
    age: 28,
    city: "Cairo",
    country: "EG",
    languages: ["ar"],
    marriageTimeline: "notSure",
    createdAt: "2026-03-11T00:00:00.000Z",
    lastActiveAt: "2026-03-11T00:00:00.000Z",
  }),
  seedCandidate("p6", {
    age: 35,
    city: "Istanbul",
    country: "TR",
    languages: ["ar", "en", "tr"],
    maritalStatus: "widowed",
    createdAt: "2026-03-09T00:00:00.000Z",
    lastActiveAt: "2026-03-20T00:00:00.000Z",
  }),
  seedCandidate("p7", {
    age: 24,
    city: "Dubai",
    country: "AE",
    languages: ["ar", "en"],
    createdAt: "2026-03-13T00:00:00.000Z",
    lastActiveAt: "2026-03-13T00:00:00.000Z",
  }),
  seedCandidate("p8", {
    age: 30,
    city: "Istanbul",
    country: "TR",
    religiousness: "moderate",
    createdAt: "2026-03-07T00:00:00.000Z",
    lastActiveAt: "2026-03-16T00:00:00.000Z",
  }),
];
