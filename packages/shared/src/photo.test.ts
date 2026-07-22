import { describe, expect, it } from "vitest";
import {
  canDecidePhoto,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  photoModerationOutcome,
  validatePhotoFile,
} from "./photo";

describe("validatePhotoFile", () => {
  it("accepts a valid image under the limits", () => {
    expect(validatePhotoFile({ type: "image/jpeg", size: 1_000_000 }, 0)).toBeNull();
  });

  it("rejects an unsupported type", () => {
    expect(validatePhotoFile({ type: "image/gif", size: 1000 }, 0)).toBe("type");
  });

  it("rejects a file over the size limit", () => {
    expect(validatePhotoFile({ type: "image/png", size: MAX_PHOTO_BYTES + 1 }, 0)).toBe("size");
  });

  it("rejects once the photo count limit is reached", () => {
    expect(validatePhotoFile({ type: "image/webp", size: 1000 }, MAX_PHOTOS)).toBe("limit");
  });
});

describe("canDecidePhoto / photoModerationOutcome", () => {
  it("requires staff and a pending photo", () => {
    expect(canDecidePhoto({ moderation: "pending" }, true)).toEqual({ ok: true });
    expect(canDecidePhoto({ moderation: "pending" }, false)).toMatchObject({ reason: "notStaff" });
    expect(canDecidePhoto({ moderation: "approved" }, true)).toMatchObject({
      reason: "notPending",
    });
  });

  it("maps decisions to moderation states", () => {
    expect(photoModerationOutcome("approve")).toBe("approved");
    expect(photoModerationOutcome("reject")).toBe("rejected");
  });
});
