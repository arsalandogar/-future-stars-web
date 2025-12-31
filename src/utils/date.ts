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
