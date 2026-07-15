/**
 * Phone number helpers.
 *
 * The app is India-focused, so numbers may be entered with or without the
 * `+91` country code, with spaces, dashes, or a leading `0`. These helpers
 * normalise everything to a single canonical form so that, e.g.
 * `+919346254625`, `919346254625`, `09346254625`, `9346254625` and
 * `+91 93462 54625` are all treated as the same number.
 */

/** Strip everything except digits and drop any leading zeros. */
function digitsOnly(input: string): string {
  return input.replace(/\D/g, "").replace(/^0+/, "");
}

/**
 * Canonical comparison key for a phone number: its last 10 digits.
 * Use this whenever comparing two numbers for equality. Returns "" for
 * anything that isn't a phone number (e.g. an email address).
 */
export function phoneKey(input: string): string {
  if (!input) return "";
  const digits = digitsOnly(input);
  if (digits.length < 10) return digits;
  return digits.slice(-10);
}

/** True if two phone numbers refer to the same subscriber, ignoring format. */
export function phonesMatch(a: string, b: string): boolean {
  const ka = phoneKey(a);
  const kb = phoneKey(b);
  return ka !== "" && ka === kb;
}

/**
 * Convert a number to E.164 (`+91XXXXXXXXXX`) for sending SMS.
 * Falls back to the raw digits with a leading `+` if it doesn't look like a
 * 10-digit Indian mobile.
 */
export function toE164(input: string, defaultCountryCode = "91"): string {
  const digits = digitsOnly(input);
  if (digits.length === 10) return `+${defaultCountryCode}${digits}`;
  return `+${digits}`;
}

/** True when the identifier looks like an email address rather than a phone. */
export function isEmail(id: string): boolean {
  return /.+@.+\..+/.test(id);
}
