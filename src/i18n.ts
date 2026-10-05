import type { AttackName, Locale } from "./lib/crack-time";

export type { Locale };

const de = {
  heroLead: "Passwörter und",
  heroTail: "Secret-Tokens.",
  language: "Sprache",
  themeToLight: "Helles Design",
  themeToDark: "Dunkles Design",
  password: "Passwort",
  token: "Secret-Token",
  placeholderPassword: "Klicke auf „Passwort generieren“.",
  placeholderToken: "Klicke auf „Secret-Token generieren“.",
  copy: "Kopieren",
  copied: "Kopiert ✓",
  copyFailed: "Fehlgeschlagen",
  length: "Länge",
  characters: "Zeichen",
  bytes: "Bytes",
  encoding: "Kodierung",
  generatePassword: "Passwort generieren",
  generateToken: "Secret-Token generieren",
  stale: "Einstellungen geändert. Generiere einen neuen Wert.",
  strength: "Stärke",
  strengthSub: "Durchschnittliche Zeit, bis ein Angreifer den Wert findet.",
  entropy: "Entropie",
  bits: "Bit",
  "attack-online": "Online-Login",
  "rate-online": "10 Versuche pro Sekunde",
  "attack-slow-hash": "Datenleck, langsamer Hash",
  "rate-slow-hash": "10.000 Versuche pro Sekunde (bcrypt, Argon2)",
  "attack-fast-hash": "Datenleck, schneller Hash",
  "rate-fast-hash": "100 Mrd. Versuche pro Sekunde (MD5, SHA-1)",
  wordNote:
    "Gilt für zufällige Werte wie diesen. Ein Name oder Wort mit 8 Zeichen fällt viel schneller, weil Angreifer zuerst Wortlisten probieren.",
  footerLead: "Zufall aus",
  footerTail: ". Läuft offline und sendet nichts über das Netzwerk.",
} as const;

export type MessageKey = keyof typeof de;

// The type makes the English list complete: a missing key is a type error.
const en: Record<MessageKey, string> = {
  heroLead: "Passwords and",
  heroTail: "secret tokens.",
  language: "Language",
  themeToLight: "Light mode",
  themeToDark: "Dark mode",
  password: "Password",
  token: "Secret token",
  placeholderPassword: "Click “Generate password”.",
  placeholderToken: "Click “Generate secret token”.",
  copy: "Copy",
  copied: "Copied ✓",
  copyFailed: "Failed",
  length: "Length",
  characters: "Characters",
  bytes: "Bytes",
  encoding: "Encoding",
  generatePassword: "Generate password",
  generateToken: "Generate secret token",
  stale: "Settings changed. Generate a new value.",
  strength: "Strength",
  strengthSub: "Average time until an attacker finds the value.",
  entropy: "Entropy",
  bits: "bits",
  "attack-online": "Online login",
  "rate-online": "10 guesses per second",
  "attack-slow-hash": "Data leak, slow hash",
  "rate-slow-hash": "10,000 guesses per second (bcrypt, Argon2)",
  "attack-fast-hash": "Data leak, fast hash",
  "rate-fast-hash": "100 billion guesses per second (MD5, SHA-1)",
  wordNote:
    "Applies to random values like this one. A name or word with 8 characters falls much faster, because attackers try word lists first.",
  footerLead: "Randomness from",
  footerTail: ". Runs offline and sends nothing over the network.",
};

const MESSAGES: Record<Locale, Record<MessageKey, string>> = { de, en };

export function t(locale: Locale, key: MessageKey): string {
  return MESSAGES[locale][key];
}

export function attackKeys(name: AttackName): {
  label: MessageKey;
  rate: MessageKey;
} {
  return { label: `attack-${name}`, rate: `rate-${name}` };
}

export function isMessageKey(key: string | undefined): key is MessageKey {
  return key !== undefined && key in de;
}

/** The saved choice wins. Else the first browser language that keysmith has. Else German. */
export function pickLocale(
  saved: string | null,
  browserLanguages: readonly string[],
): Locale {
  if (saved === "de" || saved === "en") return saved;
  for (const language of browserLanguages) {
    const base = language.toLowerCase().split("-")[0];
    if (base === "de" || base === "en") return base;
  }
  return "de";
}
