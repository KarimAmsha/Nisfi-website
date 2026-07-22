import { describe, expect, it } from "vitest";
import { evaluateBlock } from "./blocks";

describe("evaluateBlock (CF10 core)", () => {
  it("allows blocking another member", () => {
    expect(evaluateBlock("omar", "aisha")).toEqual({ ok: true });
  });

  it("denies blocking yourself", () => {
    expect(evaluateBlock("omar", "omar")).toEqual({ ok: false, reason: "self" });
  });
});
