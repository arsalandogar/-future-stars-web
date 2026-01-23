import type { PackCard } from '@/types';

export function convertPackCardsToMap(
  packCards: PackCard[]
): Map<number, number> {
  return new Map(packCards.map((pc) => [pc.cardId, pc.quantity]));
}
