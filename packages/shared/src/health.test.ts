import { describe, expect, it } from "vitest";
import { canViewHealth, overallHealth } from "./health";

describe("canViewHealth", () => {
  it("is staff (moderator+)", () => {
    expect(canViewHealth("moderator")).toBe(true);
    expect(canViewHealth("admin")).toBe(true);
    expect(canViewHealth("user")).toBe(false);
  });
});

describe("overallHealth", () => {
  it("is the worst of the subsystem checks", () => {
    expect(overallHealth({})).toBe("healthy");
    expect(overallHealth({ db: { status: "healthy" }, fn: { status: "healthy" } })).toBe("healthy");
    expect(overallHealth({ db: { status: "healthy" }, fn: { status: "degraded" } })).toBe(
      "degraded",
    );
    expect(overallHealth({ db: { status: "down" }, fn: { status: "degraded" } })).toBe("down");
  });
});
