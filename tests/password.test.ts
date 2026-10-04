import { describe, expect, it } from "vitest";
import { CHARACTER_CLASSES, generatePassword } from "../src/lib/password";

describe("generatePassword", () => {
  it("makes 20 characters with every character class by default", () => {
    const password = generatePassword();
    expect(password).toHaveLength(20);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[^a-zA-Z0-9]/);
  });

  it.each([8, 12, 64])("makes a password of length %i", (length) => {
    expect(generatePassword({ length })).toHaveLength(length);
  });

  it.each([7, 0, -5, 10.5])(
    "rejects length %s (minimum is 8, integers only)",
    (length) => {
      expect(() => generatePassword({ length })).toThrow(RangeError);
    },
  );

  it("uses only the enabled character classes", () => {
    for (let i = 0; i < 200; i++) {
      expect(generatePassword({ uppercase: false, symbols: false })).toMatch(
        /^[a-z0-9]+$/,
      );
      expect(
        generatePassword({
          lowercase: false,
          uppercase: false,
          symbols: false,
        }),
      ).toMatch(/^[0-9]+$/);
    }
  });

  it("puts every enabled class into every password, also at the minimum length", () => {
    // At length 8, a plain draw misses the digits class in about 4 of 10 passwords.
    for (let i = 0; i < 1_000; i++) {
      const password = generatePassword({ length: 8 });
      for (const chars of Object.values(CHARACTER_CLASSES)) {
        expect([...password].some((c) => chars.includes(c))).toBe(true);
      }
    }
  });

  it("rejects a request with no character class", () => {
    expect(() =>
      generatePassword({
        lowercase: false,
        uppercase: false,
        digits: false,
        symbols: false,
      }),
    ).toThrow(RangeError);
  });

  it("chooses every character of the pool with equal chance", () => {
    // Digits only: 10 000 characters over 10 values, 1 000 expected each, standard deviation
    // about 30. A tolerance of ±200 is more than 6 standard deviations.
    const counts = new Map<string, number>();
    for (let i = 0; i < 500; i++) {
      for (const c of generatePassword({
        length: 20,
        lowercase: false,
        uppercase: false,
        symbols: false,
      })) {
        counts.set(c, (counts.get(c) ?? 0) + 1);
      }
    }
    expect([...counts.keys()].sort().join("")).toBe("0123456789");
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(800);
      expect(count).toBeLessThan(1_200);
    }
  });
});
