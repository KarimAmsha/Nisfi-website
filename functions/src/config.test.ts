import { describe, expect, it } from "vitest";
import { DEFAULT_APP_CONFIG } from "@nisfi/shared";
import { evaluateConfigChange } from "./config";

describe("evaluateConfigChange (CF core)", () => {
  it("refuses non-admins", () => {
    expect(
      evaluateConfigChange(
        "moderator",
        { kind: "flag", key: "signupsEnabled", value: false },
        DEFAULT_APP_CONFIG,
      ),
    ).toMatchObject({ ok: false, reason: "notAllowed" });
  });

  it("returns the path and before/after for a valid flag change (audit)", () => {
    expect(
      evaluateConfigChange(
        "admin",
        { kind: "flag", key: "signupsEnabled", value: false },
        DEFAULT_APP_CONFIG,
      ),
    ).toEqual({ ok: true, path: "flags.signupsEnabled", before: true, after: false });
  });

  it("audits a limit change with the prior value", () => {
    expect(
      evaluateConfigChange(
        "admin",
        { kind: "limit", key: "dailySends", value: 10 },
        DEFAULT_APP_CONFIG,
      ),
    ).toEqual({ ok: true, path: "limits.dailySends", before: 5, after: 10 });
  });

  it("propagates validation rejections (out-of-range, unknown key)", () => {
    expect(
      evaluateConfigChange(
        "admin",
        { kind: "limit", key: "dailySends", value: 9999 },
        DEFAULT_APP_CONFIG,
      ),
    ).toMatchObject({ ok: false, reason: "outOfRange" });
    expect(
      evaluateConfigChange("admin", { kind: "flag", key: "nope", value: true }, DEFAULT_APP_CONFIG),
    ).toMatchObject({ ok: false, reason: "unknownKey" });
  });
});
