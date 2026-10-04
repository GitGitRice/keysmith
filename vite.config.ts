import { defineConfig } from "vitest/config";
import { viteSingleFile } from "vite-plugin-singlefile";
import { csp } from "./build/csp.ts";

export default defineConfig({
  // csp() must come after viteSingleFile(): it hashes the inlined code.
  plugins: [viteSingleFile(), csp()],
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
