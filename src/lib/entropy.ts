import {
  enabledClasses,
  PASSWORD_DEFAULT_LENGTH,
  type PasswordOptions,
} from "./password";
import { TOKEN_DEFAULT_BYTES, type TokenOptions } from "./token";

/**
 * Estimated strength in bits: length × log2(pool size).
 * The rule "every enabled class appears once" removes a few passwords, so the true value is
 * slightly lower. The difference is well under 1 bit at the minimum length.
 */
export function passwordEntropy(options: PasswordOptions = {}): number {
  const { length = PASSWORD_DEFAULT_LENGTH } = options;
  const poolSize = enabledClasses(options).join("").length;
  return poolSize === 0 ? 0 : length * Math.log2(poolSize);
}

export function tokenEntropy({
  bytes = TOKEN_DEFAULT_BYTES,
}: TokenOptions = {}): number {
  return bytes * 8;
}
