import { describe, expect, it } from "vitest";
import {
  DEFAULT_MEMBER_PREFERENCES,
  memberPreferencesSchema,
  mergeMemberPreferences,
  notificationEnabled,
} from "./member-settings";

describe("memberPreferencesSchema", () => {
  it("accepts a full preferences object and rejects a malformed one", () => {
    expect(memberPreferencesSchema.safeParse(DEFAULT_MEMBER_PREFERENCES).success).toBe(true);
    expect(memberPreferencesSchema.safeParse({ notifications: { requests: "yes" } }).success).toBe(
      false,
    );
  });
});

describe("mergeMemberPreferences", () => {
  it("defaults every category to true when absent", () => {
    expect(mergeMemberPreferences(undefined)).toEqual(DEFAULT_MEMBER_PREFERENCES);
    expect(mergeMemberPreferences(null)).toEqual(DEFAULT_MEMBER_PREFERENCES);
    expect(mergeMemberPreferences({})).toEqual(DEFAULT_MEMBER_PREFERENCES);
  });

  it("overlays stored booleans and ignores junk", () => {
    const merged = mergeMemberPreferences({
      notifications: { messages: false, announcements: false, bogus: true },
    });
    expect(merged.notifications).toEqual({
      requests: true,
      matches: true,
      messages: false,
      announcements: false,
    });
  });
});

describe("notificationEnabled", () => {
  it("reads a category flag", () => {
    const prefs = mergeMemberPreferences({ notifications: { messages: false } });
    expect(notificationEnabled(prefs, "requests")).toBe(true);
    expect(notificationEnabled(prefs, "messages")).toBe(false);
  });
});
