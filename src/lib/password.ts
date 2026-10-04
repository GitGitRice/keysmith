import { randomInt } from "./random";

export const CHARACTER_CLASSES = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  // No quotes, backslash, backtick or space: they break shells and .env files.
  symbols: "!#$%&()*+,-./:;<=>?@[]^_{|}~",
} as const;

export type CharacterClass = keyof typeof CHARACTER_CLASSES;

export const PASSWORD_DEFAULT_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 8;

export type PasswordOptions = { length?: number } & Partial<
  Record<CharacterClass, boolean>
>;

/** The character sets of the enabled classes. A class is enabled unless it is set to false. */
export function enabledClasses(options: PasswordOptions = {}): string[] {
  return (Object.keys(CHARACTER_CLASSES) as CharacterClass[])
    .filter((name) => options[name] !== false)
    .map((name) => CHARACTER_CLASSES[name]);
}

export function generatePassword(options: PasswordOptions = {}): string {
  const { length = PASSWORD_DEFAULT_LENGTH } = options;
  if (!Number.isInteger(length) || length < PASSWORD_MIN_LENGTH) {
    throw new RangeError(
      `A password needs at least ${PASSWORD_MIN_LENGTH} characters, got ${length}`,
    );
  }
  const classes = enabledClasses(options);
  if (classes.length === 0) {
    throw new RangeError("A password needs at least one character class");
  }
  const pool = classes.join("");
  // Draw from the full pool and retry until every class is present. This keeps every
  // valid password equally likely (ADR-0003), unlike forcing one character per class.
  for (;;) {
    let password = "";
    for (let i = 0; i < length; i++) password += pool[randomInt(pool.length)];
    if (classes.every((chars) => [...password].some((c) => chars.includes(c))))
      return password;
  }
}
