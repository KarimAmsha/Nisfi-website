import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, LOCALES, directionForLocale, isLocale } from "./locale";

describe("locale", () => {
  it("declares the three V1 locales with Arabic default", () => {
    expect(LOCALES).toEqual(["ar", "en", "tr"]);
    expect(DEFAULT_LOCALE).toBe("ar");
  });

  it("marks only Arabic as right-to-left", () => {
    expect(directionForLocale("ar")).toBe("rtl");
    expect(directionForLocale("en")).toBe("ltr");
    expect(directionForLocale("tr")).toBe("ltr");
  });

  it("narrows valid locale strings", () => {
    expect(isLocale("ar")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });
});
