export const PH_TIMEZONE = "Asia/Manila";

/** YYYY-MM-DD for today in Philippines */
export function todayPH(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: PH_TIMEZONE }).format(new Date());
}

/** Normalize DB / input values to YYYY-MM-DD without timezone shift */
export function toDateOnly(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date && !isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : raw.slice(0, 10);
}

/** Format a date-only value for display in Philippines */
export function formatDatePH(value?: string | null): string {
  if (!value) return "—";
  const dateOnly = toDateOnly(value);
  const [year, month, day] = dateOnly.split("-").map(Number);
  if (!year || !month || !day) return String(value);

  const noonUtc = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return noonUtc.toLocaleDateString("en-PH", {
    timeZone: PH_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Current date/time string for print headers (PH) */
export function formatNowPH(): string {
  return new Date().toLocaleString("en-PH", {
    timeZone: PH_TIMEZONE,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
