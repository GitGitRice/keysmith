/**
 * Attacker models for the crack-time estimate. The rates are rough orders of magnitude for
 * one attacker with current hardware (2026):
 * - online: guesses through a login form. Real services lock or slow down much earlier.
 * - slow-hash: a stolen database with bcrypt (cost 10) or Argon2 hashes, on a few GPUs.
 * - fast-hash: a stolen database with MD5, SHA-1 or NTLM hashes, on a few GPUs.
 */
export const ATTACKS = [
  { name: "online", guessesPerSecond: 10 },
  { name: "slow-hash", guessesPerSecond: 1e4 },
  { name: "fast-hash", guessesPerSecond: 1e11 },
] as const;

export type AttackName = (typeof ATTACKS)[number]["name"];

/**
 * Average time in seconds to find a random value with this entropy. On average an attacker
 * tries half of all 2^bits values before the hit, so the time is 2^(bits−1) / rate.
 */
export function crackSeconds(bits: number, guessesPerSecond: number): number {
  return 2 ** (bits - 1) / guessesPerSecond;
}

export type Locale = "de" | "en";

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365.25 * DAY;

const UNIT_SECONDS = [YEAR, DAY, HOUR, MINUTE, 1] as const;

const WORDS = {
  de: {
    lessThanOneSecond: "< 1 Sekunde",
    // Same order as UNIT_SECONDS: [singular, plural]
    units: [
      ["Jahr", "Jahre"],
      ["Tag", "Tage"],
      ["Stunde", "Stunden"],
      ["Minute", "Minuten"],
      ["Sekunde", "Sekunden"],
    ],
    large: ["Bio.", "Mrd.", "Mio.", "Tsd."],
    years: "Jahre",
  },
  en: {
    lessThanOneSecond: "< 1 second",
    units: [
      ["year", "years"],
      ["day", "days"],
      ["hour", "hours"],
      ["minute", "minutes"],
      ["second", "seconds"],
    ],
    large: ["trillion", "billion", "million", "thousand"],
    years: "years",
  },
} as const;

const LARGE_FACTORS = [1e12, 1e9, 1e6, 1e3] as const;

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";

function superscript(n: number): string {
  return [...String(n)].map((digit) => SUPERSCRIPT[Number(digit)]).join("");
}

/** A short text for a duration, for example "≈ 20 Sekunden" or "≈ 3 million years". */
export function formatDuration(seconds: number, locale: Locale = "de"): string {
  const words = WORDS[locale];
  if (seconds < 1) return words.lessThanOneSecond;
  const years = seconds / YEAR;
  if (years >= 1e15)
    return `≈ 10${superscript(Math.floor(Math.log10(years)))} ${words.years}`;
  for (const [i, factor] of LARGE_FACTORS.entries()) {
    if (years >= factor)
      return `≈ ${Math.round(years / factor)} ${words.large[i]} ${words.years}`;
  }
  for (const [i, unitSeconds] of UNIT_SECONDS.entries()) {
    if (seconds >= unitSeconds) {
      const count = Math.round(seconds / unitSeconds);
      const [one, many] = words.units[i] ?? ["", ""];
      return `≈ ${count} ${count === 1 ? one : many}`;
    }
  }
  return words.lessThanOneSecond;
}
