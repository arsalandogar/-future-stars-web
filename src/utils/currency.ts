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
