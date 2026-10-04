import { createHash } from "node:crypto";
import type { Plugin } from "vite";

const INLINE_SCRIPT = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const INLINE_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/g;

function hashes(html: string, pattern: RegExp): string {
  return [...html.matchAll(pattern)]
    .map((match) => match[1] ?? "")
    .map(
      (code) =>
        `'sha256-${createHash("sha256").update(code).digest("base64")}'`,
    )
    .join(" ");
}

/**
 * Adds a Content-Security-Policy <meta> tag (ADR-0004). It allows only the inline script and
 * style of this exact build, by hash. Everything else is blocked, so the page can make no
 * network request.
 */
export function addCsp(html: string): string {
  const policy = [
    "default-src 'none'",
    `script-src ${hashes(html, INLINE_SCRIPT) || "'none'"}`,
    `style-src ${hashes(html, INLINE_STYLE) || "'none'"}`,
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
  const tag = `<meta http-equiv="Content-Security-Policy" content="${policy}" />`;
  return html.replace(
    /<meta charset="UTF-8" \/>/i,
    (charset) => `${charset}\n    ${tag}`,
  );
}

/**
 * Runs after vite-plugin-singlefile has inlined JS and CSS. Build only: the dev server loads
 * scripts by URL and opens a WebSocket, which this policy blocks.
 */
export function csp(): Plugin {
  return {
    name: "keysmith:csp",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "asset" && file.fileName.endsWith(".html")) {
          file.source = addCsp(String(file.source));
        }
      }
    },
  };
}
