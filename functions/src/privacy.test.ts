import { describe, expect, it } from "vitest";
import { ANONYMIZED_DISPLAY_NAME, DEFAULT_MEMBER_PREFERENCES } from "@nisfi/shared";
import { buildMemberExport, evaluateAccountDeletion } from "./privacy";

describe("buildMemberExport (CF core)", () => {
  it("bundles the member's own data", () => {
    const bundle = buildMemberExport({
      uid: "omar",
      profile: { displayName: "Omar" },
      preferences: DEFAULT_MEMBER_PREFERENCES,
      entitlement: null,
    });
    expect(bundle).toMatchObject({ uid: "omar", profile: { displayName: "Omar" } });
    expect(typeof bundle.exportedAt).toBe("string");
  });
});

describe("evaluateAccountDeletion (CF core)", () => {
  it("returns the anonymization + cascade plan for a self, active deletion", () => {
    const res = evaluateAccountDeletion("omar", { uid: "omar", status: "active" });
    expect(res).toEqual({
      ok: true,
      usersUpdate: { status: "deleted" },
      profileAnonymization: {
        displayName: ANONYMIZED_DISPLAY_NAME,
        about: "",
        answers: {},
        visibility: "hidden",
        photosCleared: true,
      },
      closeMatches: { closedReason: "deletion" },
      removeTokens: true,
      removeNotifications: true,
      disableAuth: true,
    });
  });

  it("refuses acting on someone else and re-deleting", () => {
    expect(evaluateAccountDeletion("omar", { uid: "aisha", status: "active" })).toMatchObject({
      reason: "notSelf",
    });
    expect(evaluateAccountDeletion("omar", { uid: "omar", status: "deleted" })).toMatchObject({
      reason: "alreadyDeleted",
    });
  });
});
