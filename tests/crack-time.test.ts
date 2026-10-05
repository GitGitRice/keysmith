import { describe, expect, it } from "vitest";
import { ATTACKS, crackSeconds, formatDuration } from "../src/lib/crack-time";
import { passwordEntropy } from "../src/lib/entropy";

const YEAR = 365.25 * 24 * 3600;

describe("crackSeconds", () => {
  it("is 2^(bits−1) / rate: the attacker finds the value after half of all guesses", () => {
    expect(crackSeconds(10, 1)).toBe(512);
    expect(crackSeconds(40, 1e11)).toBeCloseTo(5.5, 1);
  });

  it("stays finite for the strongest values (128 symbols, 64-byte token)", () => {
    expect(
      Number.isFinite(crackSeconds(passwordEntropy({ length: 128 }), 10)),
    ).toBe(true);
    expect(Number.isFinite(crackSeconds(512, 10))).toBe(true);
  });

  it("orders the attacks from slowest to fastest", () => {
    const rates = ATTACKS.map((attack) => attack.guessesPerSecond);
    expect(rates).toEqual([...rates].sort((a, b) => a - b));
  });
});

describe("formatDuration", () => {
  it("shows short times in seconds, minutes, hours and days", () => {
    expect(formatDuration(0.2)).toBe("< 1 Sekunde");
    expect(formatDuration(1)).toBe("≈ 1 Sekunde");
    expect(formatDuration(20)).toBe("≈ 20 Sekunden");
    expect(formatDuration(150)).toBe("≈ 3 Minuten");
    expect(formatDuration(3600)).toBe("≈ 1 Stunde");
    expect(formatDuration(5 * 86400)).toBe("≈ 5 Tage");
  });

  it("shows years with Tsd., Mio., Mrd. and Bio.", () => {
    expect(formatDuration(42 * YEAR)).toBe("≈ 42 Jahre");
    expect(formatDuration(7e3 * YEAR)).toBe("≈ 7 Tsd. Jahre");
    expect(formatDuration(3e6 * YEAR)).toBe("≈ 3 Mio. Jahre");
    expect(formatDuration(2e9 * YEAR)).toBe("≈ 2 Mrd. Jahre");
    expect(formatDuration(5e12 * YEAR)).toBe("≈ 5 Bio. Jahre");
  });

  it("shows a power of ten from 10^15 years", () => {
    expect(formatDuration(1e15 * YEAR)).toBe("≈ 10¹⁵ Jahre");
    expect(formatDuration(3e42 * YEAR)).toBe("≈ 10⁴² Jahre");
  });
});

describe("formatDuration in English", () => {
  it("uses English units and singular forms", () => {
    expect(formatDuration(0.2, "en")).toBe("< 1 second");
    expect(formatDuration(1, "en")).toBe("≈ 1 second");
    expect(formatDuration(150, "en")).toBe("≈ 3 minutes");
    expect(formatDuration(5 * 86400, "en")).toBe("≈ 5 days");
  });

  it("uses thousand, million, billion, trillion and powers of ten", () => {
    expect(formatDuration(7e3 * YEAR, "en")).toBe("≈ 7 thousand years");
    expect(formatDuration(3e6 * YEAR, "en")).toBe("≈ 3 million years");
    expect(formatDuration(2e9 * YEAR, "en")).toBe("≈ 2 billion years");
    expect(formatDuration(5e12 * YEAR, "en")).toBe("≈ 5 trillion years");
    expect(formatDuration(3e42 * YEAR, "en")).toBe("≈ 10⁴² years");
  });
});

describe("crack time of an 8-character password", () => {
  // The goal of the estimate: a user sees that 8 characters are weak.
  const bits = passwordEntropy({ length: 8 });

  it("falls in hours with a fast hash", () => {
    expect(formatDuration(crackSeconds(bits, 1e11))).toMatch(/Stunden|Tage/);
  });
});
