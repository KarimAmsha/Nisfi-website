import { describe, expect, it } from "vitest";
import { appDirection } from "./index";

describe("web domain wiring", () => {
  it("resolves locale direction through the shared package", () => {
    expect(appDirection("ar")).toBe("rtl");
    expect(appDirection("en")).toBe("ltr");
  });
});
