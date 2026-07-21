import type { DiscoveryCandidate, DiscoveryViewer, PublicProfile } from "@nisfi/shared";

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

/** Narrative + media extras that only the profile-detail view needs (Unit 3.3).
 * Keyed by candidate uid. Real data comes from `profiles/{uid}` + Cloudinary
 * once wired (O-001). */
const PREVIEW_DETAILS: Record<
  string,
  {
    displayName: string;
    about?: string;
    education?: string;
    occupation?: string;
    answers?: Record<string, string>;
    photoCount: number;
  }
> = {
  p1: {
    displayName: "سُمَيّة",
    about: "أبحث عن شريك يشاركني قيمي وطموحي لبناء بيت هادئ قائم على الاحترام.",
    education: "بكالوريوس تصميم",
    occupation: "مصمّمة جرافيك",
    answers: { prayer: "always", relocate: "maybe", familyPlan: "yes" },
    photoCount: 3,
  },
  p2: {
    displayName: "خديجة",
    about: "أمّ لطفلين، أقدّر الاستقرار والصدق قبل كل شيء.",
    education: "دبلوم تمريض",
    occupation: "ممرضة",
    answers: { prayer: "mostly", relocate: "no", familyPlan: "open" },
    photoCount: 2,
  },
  p3: {
    displayName: "آية",
    about: "طالبة دراسات عليا، أحبّ القراءة والعمل التطوعي.",
    education: "ماجستير قيد الإنجاز",
    occupation: "باحثة",
    answers: { prayer: "always", relocate: "yes", familyPlan: "yes" },
    photoCount: 4,
  },
  p4: {
    displayName: "زينب",
    about: "أسعى لشريك متفهّم يقدّر الحياة العائلية البسيطة.",
    occupation: "معلّمة",
    answers: { prayer: "mostly", relocate: "maybe", familyPlan: "yes" },
    photoCount: 2,
  },
  p5: {
    displayName: "مريم",
    about: "أحبّ السفر والتعرّف على الثقافات، وأبحث عن رفيق درب صادق.",
    education: "بكالوريوس محاسبة",
    occupation: "محاسبة",
    answers: { prayer: "always", relocate: "maybe", familyPlan: "unsure" },
    photoCount: 3,
  },
  p6: {
    displayName: "فاطمة",
    about: "أرمَلة، أقدّر الرحمة والالتزام، وأتطلّع لبداية جديدة هادئة.",
    occupation: "صاحبة عمل صغير",
    answers: { prayer: "mostly", relocate: "no", familyPlan: "open" },
    photoCount: 2,
  },
  p7: {
    displayName: "نور",
    about: "أحبّ الرياضة والحياة المنظّمة، وأبحث عن توافق حقيقي في القيم.",
    education: "بكالوريوس هندسة",
    occupation: "مهندسة برمجيات",
    answers: { prayer: "always", relocate: "yes", familyPlan: "yes" },
    photoCount: 4,
  },
  p8: {
    displayName: "هُدى",
    about: "هادئة الطبع، أقدّر الحوار الصادق والاحترام المتبادل.",
    occupation: "صيدلانية",
    answers: { prayer: "mostly", relocate: "maybe", familyPlan: "open" },
    photoCount: 3,
  },
};

export interface PreviewProfile {
  profile: PublicProfile;
  photoCount: number;
}

/** Assemble a full public profile for the detail view from the preview seed. */
export function getPreviewProfile(uid: string): PreviewProfile | null {
  const candidate = PREVIEW_CANDIDATES.find((c) => c.uid === uid);
  if (!candidate) return null;
  const detail = PREVIEW_DETAILS[uid] ?? { displayName: "عضو", photoCount: 2 };
  const profile: PublicProfile = {
    uid,
    displayName: detail.displayName,
    gender: candidate.gender,
    // The seed carries age, not a birthDate — synthesise one for display parity
    // with real profiles (which store birthDate and derive age).
    birthDate: `${2026 - candidate.age}-01-01`,
    country: candidate.country,
    city: candidate.city,
    maritalStatus: candidate.maritalStatus,
    children: candidate.children,
    religiousness: candidate.religiousness,
    marriageTimeline: candidate.marriageTimeline,
    languages: [...candidate.languages],
    visibility: "visible",
    verificationStatus: "verified",
    createdAt: candidate.createdAt,
    updatedAt: candidate.lastActiveAt,
    ...(detail.about !== undefined ? { about: detail.about } : {}),
    ...(detail.education !== undefined ? { education: detail.education } : {}),
    ...(detail.occupation !== undefined ? { occupation: detail.occupation } : {}),
    ...(detail.answers !== undefined ? { answers: detail.answers } : {}),
  };
  return { profile, photoCount: detail.photoCount };
}
