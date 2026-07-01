export function daysUntil(dateString: string | null): number | null {
  if (!dateString) return null;
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
