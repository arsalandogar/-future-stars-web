/**
 * Formats an ISO date string to a short localized date.
 * @param dateString - ISO date string (e.g., "2024-01-15T10:30:00Z")
 * @returns Formatted date string (e.g., "Jan 15, 2024")
 */
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Formats an ISO date string to an abbreviated uppercase month.
 * @param dateString - ISO date string (e.g., "2024-01-15")
 * @returns Uppercase abbreviated month (e.g., "JAN")
 */
export function formatMonthShort(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short' })
    .format(new Date(dateString))
    .toUpperCase();
}

/**
 * Formats an ISO date string to a date with time.
 * @param dateString - ISO date string (e.g., "2024-01-15T10:30:00Z")
 * @returns Formatted date time string (e.g., "1/15/2024 10:30am ET")
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);
}
