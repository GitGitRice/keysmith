import "./style.css";
import { passwordEntropy, tokenEntropy } from "./lib/entropy";
import { generatePassword, type PasswordOptions } from "./lib/password";
import { generateToken, type TokenEncoding } from "./lib/token";

function byId<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing element #${id}`);
  return element as T;
}

function formatBits(bits: number): string {
  return `≈ ${Math.round(bits)} Bit`;
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

function updatePassword(): void {
  // generatePassword needs at least one class, so the last checked box cannot be unchecked.
  const checked = classInputs.filter((input) => input.checked);
  for (const input of classInputs) {
    input.disabled = checked.length === 1 && input.checked;
  }
  const options = passwordOptions();
  byId("password-length-value").textContent = lengthInput.value;
  byId("password-result").textContent = generatePassword(options);
  byId("password-entropy").textContent = formatBits(passwordEntropy(options));
}

// Secret token

const tokenForm = byId<HTMLFormElement>("token-form");

function updateToken(): void {
  const data = new FormData(tokenForm);
  const options = {
    bytes: Number(data.get("bytes")),
    encoding: data.get("encoding") as TokenEncoding,
  };
  byId("token-result").textContent = generateToken(options);
  byId("token-entropy").textContent = formatBits(tokenEntropy(options));
}

// Copy

/**
 * The Clipboard API needs a secure context. Some browsers do not treat file:// as one, so
 * fall back to a selected textarea and execCommand (ADR-0004).
 */
async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fall through to the fallback.
  }
  const area = document.createElement("textarea");
  area.value = text;
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
    const text = byId(button.dataset.copy ?? "").textContent ?? "";
    let message: string;
    try {
      await copyText(text);
      message = "Kopiert ✓";
      button.classList.add("done");
    } catch {
      message = "Fehlgeschlagen";
    }
    button.textContent = message;
    copyStatus.textContent = message;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      button.textContent = "Kopieren";
      button.classList.remove("done");
      copyStatus.textContent = "";
    }, 1500);
  });
}

// Wiring

for (const [form, update] of [
  [passwordForm, updatePassword],
  [tokenForm, updateToken],
] as const) {
  form.addEventListener("input", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    update();
  });
  update();
}
