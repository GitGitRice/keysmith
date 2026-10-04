export const TOKEN_DEFAULT_BYTES = 32;
export const TOKEN_MIN_BYTES = 16;

export type TokenEncoding = "hex" | "base64url";

export interface TokenOptions {
  bytes?: number;
  encoding?: TokenEncoding;
}

export function generateToken({
  bytes = TOKEN_DEFAULT_BYTES,
  encoding = "hex",
}: TokenOptions = {}): string {
  if (!Number.isInteger(bytes) || bytes < TOKEN_MIN_BYTES) {
    throw new RangeError(
      `A secret token needs at least ${TOKEN_MIN_BYTES} bytes, got ${bytes}`,
    );
  }
  const values = crypto.getRandomValues(new Uint8Array(bytes));
  return encoding === "hex" ? toHex(values) : toBase64Url(values);
}

function toHex(values: Uint8Array): string {
  return Array.from(values, (b) => b.toString(16).padStart(2, "0")).join("");
}

function toBase64Url(values: Uint8Array): string {
  return btoa(String.fromCharCode(...values))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
