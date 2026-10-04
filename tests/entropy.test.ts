import { describe, expect, it } from "vitest";
import { passwordEntropy, tokenEntropy } from "../src/lib/entropy";

describe("passwordEntropy", () => {
  it("is length × log2(pool size) for the default password (90 characters, length 20)", () => {
    expect(passwordEntropy()).toBeCloseTo(129.84, 2);
  });

  it("counts only the enabled character classes", () => {
    // Digits only: 8 × log2(10)
    expect(
      passwordEntropy({
        length: 8,
        lowercase: false,
        uppercase: false,
        symbols: false,
      }),
    ).toBeCloseTo(26.58, 2);
  });

  it("is 0 when no character class is enabled", () => {
    expect(
      passwordEntropy({
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
      }),
    ).toBe(0);
  });
});

describe("tokenEntropy", () => {
  it("is 8 bits per byte", () => {
    expect(tokenEntropy()).toBe(256);
    expect(tokenEntropy({ bytes: 16 })).toBe(128);
  });
});
