import { describe, expect, it } from "vitest";
import { serviceDefaultLocale } from "./index";

describe("functions wiring", () => {
  it("shares the default locale with the rest of the workspace", () => {
    expect(serviceDefaultLocale()).toBe("ar");
  });
});
