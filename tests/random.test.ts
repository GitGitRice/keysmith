import { describe, expect, it } from "vitest";
import { randomInt } from "../src/lib/random";

describe("randomInt", () => {
  it("returns integers in [0, max)", () => {
    for (let i = 0; i < 10_000; i++) {
      const n = randomInt(7);
      expect(Number.isInteger(n)).toBe(true);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(7);
    }
  });

  it("returns 0 when max is 1", () => {
    expect(randomInt(1)).toBe(0);
  });

  it.each([0, -1, 1.5, Number.NaN, 2 ** 32 + 1])("rejects max = %s", (max) => {
    expect(() => randomInt(max)).toThrow(RangeError);
  });

  it("chooses every value with equal chance", () => {
    // 60 000 draws over 6 values: 10 000 expected each, standard deviation about 91.
    // A tolerance of ±500 is more than 5 standard deviations, so a false failure is very unlikely.
    const counts = new Array<number>(6).fill(0);
    for (let i = 0; i < 60_000; i++) {
      const n = randomInt(6);
      counts[n] = (counts[n] ?? 0) + 1;
    }
    for (const count of counts) {
      expect(count).toBeGreaterThan(9_500);
      expect(count).toBeLessThan(10_500);
    }
  });
});
