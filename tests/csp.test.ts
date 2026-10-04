import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { addCsp } from "../build/csp";

const sha256 = (code: string) =>
  `'sha256-${createHash("sha256").update(code).digest("base64")}'`;

const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <script type="module">console.log(1)</script>
    <style>body{color:red}</style>
  </head>
</html>`;

function policyOf(output: string): string {
  const match = /http-equiv="Content-Security-Policy" content="([^"]*)"/.exec(
    output,
  );
  if (!match?.[1]) throw new Error("no CSP tag");
  return match[1];
}

describe("addCsp", () => {
  it("puts the tag right after the charset tag", () => {
    expect(addCsp(html)).toMatch(
      /<meta charset="UTF-8" \/>\s*<meta http-equiv="Content-Security-Policy"/,
    );
  });

  it("allows the inline script and style by hash only", () => {
    const policy = policyOf(addCsp(html));
    expect(policy).toContain(`script-src ${sha256("console.log(1)")}`);
    expect(policy).toContain(`style-src ${sha256("body{color:red}")}`);
    expect(policy).not.toContain("unsafe-inline");
  });

  it("blocks everything else", () => {
    const policy = policyOf(addCsp(html));
    expect(policy).toMatch(/^default-src 'none'/);
    expect(policy).toContain("base-uri 'none'");
    expect(policy).toContain("form-action 'none'");
  });

  it("does not hash scripts that load by URL", () => {
    const policy = policyOf(
      addCsp(html.replace("</head>", '<script src="x.js"></script></head>')),
    );
    expect(policy).toContain(`script-src ${sha256("console.log(1)")};`);
  });
});
