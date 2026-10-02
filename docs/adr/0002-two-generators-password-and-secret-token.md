# 2. Two generators: password and secret token

Date: 2026-10-03 · Status: accepted

## Context

Steven needs passwords for accounts and random values for `.env` variables and secrets.

## Decision

keysmith has exactly two generators:

- **Password**: length, toggles for character classes (lowercase, uppercase, digits, symbols).
  Each enabled class appears at least once.
- **Secret token**: N random bytes, encoded as hex or base64url.

Passphrases are out of scope. So there is no word list.

## Consequences

- Two generators give enough rules for meaningful tests and keep the app small.
- A `.env` output mode (`KEY=<token>` lines) is a possible later extra.
