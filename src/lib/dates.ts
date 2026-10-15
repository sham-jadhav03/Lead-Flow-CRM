// Single source of truth for "today" and "overdue" (browser-local calendar day).
// Dates are stored as UTC ISO strings and compared against the local day here only.

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export function isToday(iso?: string | null): boolean {
  if (!iso) return false;
  const start = startOfToday();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const d = new Date(iso);
  return d >= start && d < end;
}

/** Overdue = scheduled for a day before today. Follow-ups due today are pinned instead. */
export function isOverdue(iso?: string | null): boolean {
  return !!iso && new Date(iso) < startOfToday();
}

export function timeAgo(iso: string): string {
  const s = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (s < 60) return "just now";
  const units: [number, string][] = [
    [86400 * 365, "year"],
    [86400 * 30, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [secs, name] of units) {
    if (s >= secs) {
      const n = Math.floor(s / secs);
      return `${n} ${name}${n > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

/** Value for <input type="datetime-local"> in local time. */
export function toLocalInputValue(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
