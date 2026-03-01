/**
 * Formatta una data come tempo relativo in inglese (come nel mockup)
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (diffMins < 1) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'MINUTE' : 'MINUTES'} AGO`;
  if (isToday && diffHours < 24)
    return `TODAY AT ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toUpperCase()}`;
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'HOUR' : 'HOURS'} AGO`;
  if (diffDays === 0 || diffDays === 1) return 'YESTERDAY';
  if (diffDays < 7) return `${diffDays} DAYS AGO`;
  if (diffWeeks === 1) return '1 WEEK AGO';
  if (diffWeeks < 4) return `${diffWeeks} WEEKS AGO`;
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return 'THIS MONTH';
  return `${Math.floor(diffDays / 30)} MONTHS AGO`;
}
