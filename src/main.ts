import "./style.css";
import {
  attackKeys,
  isMessageKey,
  pickLocale,
  t,
  type Locale,
  type MessageKey,
} from "./i18n";
import { ATTACKS, crackSeconds, formatDuration } from "./lib/crack-time";
import { passwordEntropy, tokenEntropy } from "./lib/entropy";
import { generatePassword, type PasswordOptions } from "./lib/password";
import { generateToken, type TokenEncoding } from "./lib/token";

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

/** Storage can be blocked (private mode, file://). Then the choice lasts only for this visit. */
function load(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function save(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // See load().
  }
}

const root = document.documentElement;

// Language

const LOCALE_KEY = "keysmith-locale";
let locale: Locale = pickLocale(load(LOCALE_KEY), navigator.languages);

function text(key: MessageKey): string {
  return t(locale, key);
}

// Strength panel

function statRow(label: string, value: string, detail?: string): HTMLElement {
  const row = document.createElement("div");
  const dt = document.createElement("dt");
  const dd = document.createElement("dd");
  dt.textContent = label;
  if (detail) {
    const small = document.createElement("small");
    small.textContent = detail;
    dt.append(small);
  }
  dd.textContent = value;
  row.append(dt, dd);
  return row;
}

/** Fills the panel from its data-bits value. Before the first value, it shows dashes. */
function renderPanel(panel: HTMLElement): void {
  const bits =
    panel.dataset.bits === undefined ? null : Number(panel.dataset.bits);
  const show = (value: () => string) => (bits === null ? "—" : value());
  panel.querySelector("dl")?.replaceChildren(
    statRow(
      text("entropy"),
      show(() => `≈ ${Math.round(bits ?? 0)} ${text("bits")}`),
    ),
    ...ATTACKS.map((attack) => {
      const keys = attackKeys(attack.name);
      return statRow(
        text(keys.label),
        show(() =>
          formatDuration(
            crackSeconds(bits ?? 0, attack.guessesPerSecond),
            locale,
          ),
        ),
        text(keys.rate),
      );
    }),
  );
}

const panels = [byId("password-stats"), byId("token-stats")];

function showStrength(panel: HTMLElement, bits: number): void {
  panel.dataset.bits = String(bits);
  renderPanel(panel);
}

// Theme

const THEME_KEY = "keysmith-theme";
const themeToggle = byId<HTMLButtonElement>("theme-toggle");
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

function currentTheme(): "light" | "dark" {
  const theme = root.dataset.theme;
  if (theme === "light" || theme === "dark") return theme;
  return systemDark.matches ? "dark" : "light";
}

function labelThemeToggle(): void {
  themeToggle.setAttribute(
    "aria-label",
    text(currentTheme() === "dark" ? "themeToLight" : "themeToDark"),
  );
}

themeToggle.addEventListener("click", () => {
  const next = currentTheme() === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  save(THEME_KEY, next);
  labelThemeToggle();
});
systemDark.addEventListener("change", labelThemeToggle);

// Apply the language

const localeButtons = [
  ...document.querySelectorAll<HTMLButtonElement>("button[data-locale]"),
];

function applyLocale(): void {
  root.lang = locale;
  for (const element of document.querySelectorAll<HTMLElement>("[data-i18n]")) {
    const key = element.dataset.i18n;
    if (isMessageKey(key)) element.textContent = text(key);
  }
  for (const element of document.querySelectorAll<HTMLElement>(
    "[data-i18n-label]",
  )) {
    const key = element.dataset.i18nLabel;
    if (isMessageKey(key)) element.setAttribute("aria-label", text(key));
  }
  for (const button of localeButtons) {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.locale === locale),
    );
  }
  panels.forEach(renderPanel);
  labelThemeToggle();
}

for (const button of localeButtons) {
  button.addEventListener("click", () => {
    locale = button.dataset.locale === "en" ? "en" : "de";
    save(LOCALE_KEY, locale);
    applyLocale();
  });
}

// Password

const passwordForm = byId<HTMLFormElement>("password-form");
const lengthInput = byId<HTMLInputElement>("password-length");
const classInputs = [
  ...passwordForm.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
];

function passwordOptions(): PasswordOptions {
  const options: PasswordOptions = { length: Number(lengthInput.value) };
  for (const input of classInputs) {
    options[input.name as keyof Omit<PasswordOptions, "length">] =
      input.checked;
  }
  return options;
}

function syncPasswordInputs(): void {
  // generatePassword needs at least one class, so the last checked box cannot be unchecked.
  const checked = classInputs.filter((input) => input.checked);
  for (const input of classInputs) {
    input.disabled = checked.length === 1 && input.checked;
  }
  byId("password-length-value").textContent = lengthInput.value;
}

function generatePasswordValue(): void {
  const options = passwordOptions();
  byId("password-result").textContent = generatePassword(options);
  showStrength(byId("password-stats"), passwordEntropy(options));
}

// Secret token

const tokenForm = byId<HTMLFormElement>("token-form");

function generateTokenValue(): void {
  const data = new FormData(tokenForm);
  const options = {
    bytes: Number(data.get("bytes")),
    encoding: data.get("encoding") as TokenEncoding,
  };
  byId("token-result").textContent = generateToken(options);
  showStrength(byId("token-stats"), tokenEntropy(options));
}

// Copy

/**
 * The Clipboard API needs a secure context. Some browsers do not treat file:// as one, so
 * fall back to a selected textarea and execCommand (ADR-0004).
 */
async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch {
    // Fall through to the fallback.
  }
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.className = "visually-hidden";
  document.body.append(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  if (!copied) throw new Error("Copy failed");
}

const copyStatus = byId("copy-status");

for (const button of document.querySelectorAll<HTMLButtonElement>(
  "button.copy",
)) {
  let timer: number | undefined;
  button.addEventListener("click", async () => {
    const value = byId(button.dataset.copy ?? "").textContent ?? "";
    let message: string;
    try {
      await copyText(value);
      message = text("copied");
      button.classList.add("done");
    } catch {
      message = text("copyFailed");
    }
    button.textContent = message;
    copyStatus.textContent = message;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      button.textContent = text("copy");
      button.classList.remove("done");
      copyStatus.textContent = "";
    }, 1500);
  });
}

// Wiring

/**
 * A value appears only after a click on the generate button. An option change keeps the old
 * value and its strength and shows a hint until the next click.
 */
for (const [form, sync, generate] of [
  [passwordForm, syncPasswordInputs, generatePasswordValue],
  [tokenForm, () => undefined, generateTokenValue],
] as const) {
  const result = form.querySelector<HTMLElement>("output.result");
  const copy = form.querySelector<HTMLButtonElement>("button.copy");
  const stale = form.querySelector<HTMLElement>(".stale");
  let generated = false;

  form.addEventListener("input", () => {
    sync();
    if (generated && stale) stale.hidden = false;
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // The result now holds a value, not the translated placeholder.
    delete result?.dataset.i18n;
    generate();
    generated = true;
    form.classList.add("has-value");
    if (copy) copy.disabled = false;
    if (stale) stale.hidden = true;
  });
  sync();
}

applyLocale();
