import { describe, expect, it } from "vitest";
import { DEFAULT_MEMBER_PREFERENCES } from "./member-settings";
import { FREE_PLAN } from "./plans";
import {
  ANONYMIZED_DISPLAY_NAME,
  assembleMemberExport,
  buildDeletionAnonymization,
  canRequestDeletion,
} from "./privacy";

describe("assembleMemberExport", () => {
  it("bundles the member's own data with a timestamp", () => {
    const bundle = assembleMemberExport({
      uid: "omar",
      profile: { displayName: "Omar", city: "Istanbul" },
      preferences: DEFAULT_MEMBER_PREFERENCES,
      entitlement: { plan: FREE_PLAN.id, grantedAt: "2026-01-01T00:00:00.000Z", grantedBy: null },
      exportedAt: "2026-03-20T00:00:00.000Z",
    });
    expect(bundle).toEqual({
      exportedAt: "2026-03-20T00:00:00.000Z",
      uid: "omar",
      profile: { displayName: "Omar", city: "Istanbul" },
      preferences: DEFAULT_MEMBER_PREFERENCES,
      entitlement: { plan: "free", grantedAt: "2026-01-01T00:00:00.000Z", grantedBy: null },
    });
  });
});

describe("buildDeletionAnonymization", () => {
  it("clears personal content and hides the profile", () => {
    expect(buildDeletionAnonymization()).toEqual({
      displayName: ANONYMIZED_DISPLAY_NAME,
      about: "",
      answers: {},
      visibility: "hidden",
      photosCleared: true,
    });
  });
});

describe("canRequestDeletion", () => {
  it("allows any non-deleted account and refuses an already-deleted one", () => {
    expect(canRequestDeletion("active")).toBe(true);
    expect(canRequestDeletion("suspended")).toBe(true);
    expect(canRequestDeletion("banned")).toBe(true);
    expect(canRequestDeletion("deleted")).toBe(false);
  });
});
