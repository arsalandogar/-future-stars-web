import type { Card, Pack } from '@/types';

export type ShareableType = 'card' | 'pack';

export interface SharedLink {
  id: number;
  code: string;
  userId: number;
  shareableType: ShareableType;
  cardId: number | null;
  packId: number | null;
  message: string | null;
  isActive: boolean;
  addToCartCount: number;
  addToCollectionCount: number;
  card?: Card;
  pack?: Pack;
  user?: { id: number; firstName: string; lastName: string; fullName: string };
}

export interface CreateSharedLinkParams {
  shareableType: ShareableType;
  cardId?: number;
  packId?: number;
  message?: string;
}

export interface AddToCartResponse {
  type: ShareableType;
  pack: { id: number; userId: number; name: string; sharedLinkCode: string };
  cartItem: { id: number; userId: number; packId: number; quantity: number };
}

export interface AddToCollectionResponse {
  type: ShareableType;
  card?: Card;
  pack?: Pack;
}
