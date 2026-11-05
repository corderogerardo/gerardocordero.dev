/**
 * Timestamps arrive as RFC 3339 UTC. Rendering them without `Date` keeps the
 * output identical across devices, locales and time zones — a trading log should
 * not shift because the phone is elsewhere.
 */
export function formatTimestamp(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!match) return iso;

  const [, year, month, day, hours, minutes] = match;
  return `${year}-${month}-${day} ${hours}:${minutes} UTC`;
}
