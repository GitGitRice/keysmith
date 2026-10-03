import { describe, expect, it } from "vitest";
import { generateToken } from "../src/lib/token";

describe("generateToken", () => {
  it("makes 32 bytes as hex by default", () => {
    expect(generateToken()).toMatch(/^[0-9a-f]{64}$/);
  });

  it("makes the requested number of bytes", () => {
    expect(generateToken({ bytes: 16 })).toMatch(/^[0-9a-f]{32}$/);
    expect(generateToken({ bytes: 48 })).toMatch(/^[0-9a-f]{96}$/);
  });

  it("encodes as base64url without padding", () => {
    const token = generateToken({ encoding: "base64url" });
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
  });

  it("encodes the requested number of bytes as base64url", () => {
    const token = generateToken({ bytes: 16, encoding: "base64url" });
    expect(token).toMatch(/^[A-Za-z0-9_-]{22}$/);
    expect(Buffer.from(token, "base64url")).toHaveLength(16);
  });

  it.each([15, 0, -1, 16.5])(
    "rejects %s bytes (minimum is 16, integers only)",
    (bytes) => {
      expect(() => generateToken({ bytes })).toThrow(RangeError);
    },
  );
});
