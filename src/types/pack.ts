import type { Card, SharedLinkInfo } from './card';

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
  sharedLink?: SharedLinkInfo;
  createdAt: string;
  updatedAt: string;
}

export const MAX_PACK_CARDS = 20;
