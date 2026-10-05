import { describe, expect, it } from "vitest";
import { pickLocale, t } from "../src/i18n";

describe("pickLocale", () => {
  it("uses the saved choice first", () => {
    expect(pickLocale("en", ["de-DE"])).toBe("en");
    expect(pickLocale("de", ["en-US"])).toBe("de");
  });

  it("ignores an unknown saved value", () => {
    expect(pickLocale("fr", ["en-GB"])).toBe("en");
  });

  it("uses the first browser language that keysmith has", () => {
    expect(pickLocale(null, ["fr-FR", "en-US", "de"])).toBe("en");
    expect(pickLocale(null, ["DE-at"])).toBe("de");
  });

  it("falls back to German", () => {
    expect(pickLocale(null, ["fr", "es"])).toBe("de");
    expect(pickLocale(null, [])).toBe("de");
  });
});

describe("t", () => {
  it("returns the text for the locale", () => {
    expect(t("de", "generatePassword")).toBe("Passwort generieren");
    expect(t("en", "generatePassword")).toBe("Generate password");
  });
});
