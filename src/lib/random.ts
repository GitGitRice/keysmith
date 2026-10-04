const UINT32_RANGE = 2 ** 32;

/**
 * Returns a uniform random integer in [0, max), from crypto.getRandomValues.
 *
 * Rejection sampling (ADR-0003): draws at or above the largest multiple of `max`
 * are thrown away, so `value % max` has no modulo bias.
 */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max < 1 || max > UINT32_RANGE) {
    throw new RangeError(`max must be an integer in [1, 2^32], got ${max}`);
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % max);
  for (;;) {
    const [value] = crypto.getRandomValues(new Uint32Array(1));
    if (value !== undefined && value < limit) return value % max;
  }
}
