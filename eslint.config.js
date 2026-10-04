import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  {
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      // ADR-0003: randomness comes only from crypto.getRandomValues.
      "no-restricted-properties": [
        "error",
        {
          object: "Math",
          property: "random",
          message: "Use randomInt from src/lib/random.ts (ADR-0003).",
        },
      ],
    },
  },
  prettier,
);
