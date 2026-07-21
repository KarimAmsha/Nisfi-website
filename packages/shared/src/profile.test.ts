import { describe, expect, it } from "vitest";
import { editableProfileSchema, EDITABLE_PROFILE_KEYS, privateProfileSchema } from "./profile";

const valid = {
  displayName: "Aisha",
  gender: "female",
  birthDate: "1996-05-01",
  country: "TR",
  city: "Istanbul",
  maritalStatus: "single",
  children: "none",
  religiousness: "practicing",
  marriageTimeline: "withinYear",
  languages: ["ar", "en"],
  visibility: "visible",
} as const;

describe("editableProfileSchema", () => {
  it("accepts a well-formed profile", () => {
    expect(editableProfileSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an invalid birthDate format", () => {
    expect(editableProfileSchema.safeParse({ ...valid, birthDate: "05/01/1996" }).success).toBe(
      false,
    );
  });

  it("rejects an unsupported language", () => {
    expect(editableProfileSchema.safeParse({ ...valid, languages: ["fr"] }).success).toBe(false);
  });

  it("exposes the editable key list used by security rules", () => {
    expect(EDITABLE_PROFILE_KEYS).toContain("displayName");
    expect(EDITABLE_PROFILE_KEYS).not.toContain("verificationStatus");
  });
});

describe("privateProfileSchema", () => {
  it("accepts an empty private document", () => {
    expect(privateProfileSchema.safeParse({}).success).toBe(true);
  });

  it("rejects an over-long phone number", () => {
    expect(privateProfileSchema.safeParse({ phoneNumber: "1".repeat(40) }).success).toBe(false);
  });
});
