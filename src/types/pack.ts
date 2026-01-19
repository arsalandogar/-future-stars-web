import type { Card } from './card';

export interface PackCard {
  packId: number;
  cardId: number;
  quantity: number;
  card: Card;
}

export interface Pack {
  id: number;
  userId: number;
  name: string;
  packCards: PackCard[];
  createdAt: string;
  updatedAt: string;
}

export const MAX_PACK_CARDS = 20;
