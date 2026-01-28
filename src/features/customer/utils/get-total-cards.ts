/**
 * Calculates the total number of cards in a pack by summing up quantities.
 */
export function getTotalCards(packCards: Array<{ quantity: number }>): number {
  return packCards.reduce((sum, pc) => sum + pc.quantity, 0);
}
