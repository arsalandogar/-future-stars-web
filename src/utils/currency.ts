/**
 * Formats an amount in cents to a USD currency string.
 * @param amountInCents - The amount in cents (e.g., 1000 = $10.00)
 * @returns Formatted currency string (e.g., "$10.00")
 */
export function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

/**
 * Formats an amount in cents to a compact USD currency string (no decimals).
 * @param amountInCents - The amount in cents (e.g., 1000 = $10)
 * @returns Formatted currency string without decimals (e.g., "$10")
 */
export function formatCurrencyCompact(amountInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountInCents / 100);
}
