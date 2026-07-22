import { describe, expect, it } from "vitest";
import { canManageConfig, validateConfigChange } from "./app-config";

describe("canManageConfig", () => {
  it("is admin+", () => {
    expect(canManageConfig("admin")).toBe(true);
    expect(canManageConfig("superAdmin")).toBe(true);
    expect(canManageConfig("moderator")).toBe(false);
    expect(canManageConfig("user")).toBe(false);
  });
});

describe("validateConfigChange — flags", () => {
  it("accepts an allow-listed boolean flag", () => {
    expect(validateConfigChange({ kind: "flag", key: "signupsEnabled", value: false })).toEqual({
      ok: true,
      path: "flags.signupsEnabled",
      value: false,
    });
  });
  it("rejects unknown keys and non-boolean values", () => {
    expect(validateConfigChange({ kind: "flag", key: "hackFlag", value: true })).toMatchObject({
      reason: "unknownKey",
    });
    expect(
      // @ts-expect-error deliberately wrong value type
      validateConfigChange({ kind: "flag", key: "chatEnabled", value: "yes" }),
    ).toMatchObject({ reason: "invalidValue" });
  });
});

describe("validateConfigChange — limits", () => {
  it("accepts an in-range integer", () => {
    expect(validateConfigChange({ kind: "limit", key: "dailySends", value: 8 })).toEqual({
      ok: true,
      path: "limits.dailySends",
      value: 8,
    });
  });
  it("rejects unknown keys, out-of-range, and non-integers", () => {
    expect(validateConfigChange({ kind: "limit", key: "nope", value: 3 })).toMatchObject({
      reason: "unknownKey",
    });
    expect(validateConfigChange({ kind: "limit", key: "dailySends", value: 999 })).toMatchObject({
      reason: "outOfRange",
    });
    expect(validateConfigChange({ kind: "limit", key: "dailySends", value: 2.5 })).toMatchObject({
      reason: "invalidValue",
    });
  });
});

describe("validateConfigChange — content", () => {
  it("accepts a localized block and rejects overflow / unknown keys", () => {
    expect(
      validateConfigChange({
        kind: "content",
        key: "announcement",
        value: { ar: "مرحبا", en: "Hello", tr: "Merhaba" },
      }),
    ).toMatchObject({ ok: true, path: "content.announcement" });
    expect(
      validateConfigChange({
        kind: "content",
        key: "announcement",
        value: { ar: "x".repeat(601), en: "", tr: "" },
      }),
    ).toMatchObject({ reason: "invalidValue" });
    expect(
      validateConfigChange({
        kind: "content",
        key: "unknownBlock",
        value: { ar: "", en: "", tr: "" },
      }),
    ).toMatchObject({ reason: "unknownKey" });
  });
});
