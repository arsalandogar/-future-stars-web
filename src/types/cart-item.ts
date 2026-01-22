import type { Pack } from './pack';

export interface CartItem {
  id: number;
  userId: number;
  packId: number;
  orderId: number | null;
  quantity: number;
  totalPrice: number;
  pack: Pack;
  createdAt: string;
  updatedAt: string;
}
