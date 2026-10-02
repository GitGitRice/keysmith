# 3. Uniform sampling, defaults and minimums

Date: 2026-10-03 · Status: accepted

## Decision

- Randomness comes only from `crypto.getRandomValues`. `Math.random` is not used.
- Characters are chosen by rejection sampling, so each character has exactly equal chance
  (no modulo bias). A test checks the distribution over many draws.
- Defaults: password 20 characters, secret token 32 bytes.
- Minimums: password 8 characters, secret token 16 bytes. Lower values raise an error.
- The UI shows an entropy estimate in bits for each result.

## Consequences

Tests check properties (length, classes, encoding, errors, distribution), not exact output. So
they need no fixed seed.
