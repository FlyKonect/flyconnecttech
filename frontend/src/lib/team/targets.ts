/**
 * Response targets (Settings, screen 33) are written the design's way,
 * "4 hours" or "1 business day", and saved short, "4h" or "1bd", as the
 * backend's SLA rules read them (backend/src/requests/sla.ts).
 */

const UNITS: [RegExp, "m" | "h" | "bd"][] = [
  [/^(m|mins?|minutes?)$/, "m"],
  [/^(h|hrs?|hours?)$/, "h"],
  [/^(bd|business\s*days?|working\s*days?)$/, "bd"],
];

/** "4 hours" -> "4h", "1 business day" -> "1bd", "30 minutes" -> "30m". */
export function targetCode(text: string): string | null {
  const match = /^\s*(\d+)\s*([a-z\s]+?)\s*$/i.exec(text);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isInteger(amount) || amount <= 0) return null;
  const unit = UNITS.find(([pattern]) =>
    pattern.test(match[2].toLowerCase()),
  )?.[1];
  if (!unit) return null;
  // The backend's limit: 30 business days, or the same in hours.
  const minutes = unit === "m" ? amount : unit === "h" ? amount * 60 : 0;
  if (unit === "bd" ? amount > 30 : minutes > 30 * 24 * 60) return null;
  return `${amount}${unit}`;
}

/** "4h" -> "4 hours", "1bd" -> "1 business day". */
export function targetWords(code: string): string {
  const match = /^(\d+)(m|h|bd)$/.exec(code.trim());
  if (!match) return code;
  const amount = Number(match[1]);
  const one = amount === 1;
  const unit = {
    m: one ? "minute" : "minutes",
    h: one ? "hour" : "hours",
    bd: one ? "business day" : "business days",
  }[match[2] as "m" | "h" | "bd"];
  return `${amount} ${unit}`;
}
