import { describe, expect, it } from "vitest";
import { canExport, csvField, toCsv, validateExportRequest } from "./export";

describe("canExport", () => {
  it("is admin+", () => {
    expect(canExport("admin")).toBe(true);
    expect(canExport("superAdmin")).toBe(true);
    expect(canExport("moderator")).toBe(false);
  });
});

describe("validateExportRequest", () => {
  it("returns safe columns for an allow-listed table", () => {
    const res = validateExportRequest("admin", "reports");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.columns).toContain("status");
      expect(res.columns).not.toContain("reporterUid");
      expect(res.columns).not.toContain("details");
    }
  });

  it("drops requested sensitive columns and keeps only the allow-list", () => {
    const res = validateExportRequest("admin", "reports", 100, ["status", "reporterUid", "reason"]);
    expect(res.ok).toBe(true);
    if (res.ok) expect(res.columns).toEqual(["reason", "status"]);
  });

  it("refuses non-admins, unknown tables, and bad row limits", () => {
    expect(validateExportRequest("moderator", "reports")).toMatchObject({ reason: "notAllowed" });
    expect(validateExportRequest("admin", "secrets")).toMatchObject({ reason: "unknownTable" });
    expect(validateExportRequest("admin", "reports", 0)).toMatchObject({
      reason: "invalidRowLimit",
    });
    expect(validateExportRequest("admin", "reports", 5000)).toMatchObject({
      reason: "invalidRowLimit",
    });
  });
});

describe("csvField / toCsv", () => {
  it("escapes fields containing commas, quotes, and newlines", () => {
    expect(csvField("plain")).toBe("plain");
    expect(csvField("a,b")).toBe('"a,b"');
    expect(csvField('he said "hi"')).toBe('"he said ""hi"""');
  });

  it("emits only the given columns", () => {
    const csv = toCsv([{ id: "1", status: "open", secret: "x" }], ["id", "status"]);
    expect(csv).toBe("id,status\n1,open");
  });
});
