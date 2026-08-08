const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || "").trim());
}

export function isValidPassword(value) {
  return String(value || "").length >= 6;
}

export function isValidPhone(value) {
  if (!value) return true; // phone is optional
  return /^\d{7,15}$/.test(String(value).trim());
}

export function isNonEmpty(value) {
  return String(value || "").trim().length > 0;
}
