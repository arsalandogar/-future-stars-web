import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

export interface CardSnapshot {
  id: number;
  originalCardId: number;
  quantity: number;
  frontCardImage: string;
  backCardImage: string;
}

export interface PackSnapshot {
  id: number;
  name: string;
  cardSnapshots: CardSnapshot[];
}

export interface OrderLineItem {
  id: number;
  packId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  packName: string;
  packSnapshot: PackSnapshot;
}

export type OrderStatus =
  | 'created'
  | 'payment_failed'
  | 'paid'
  | 'processing'
  | 'sent_to_production'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface Order {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  shippingCost: number;
  discount: number;
  promoCode?: string;
  trackingNumber?: string;
  trackingCarrier?: string;
  lineItems: OrderLineItem[];
  shippingAddress?: {
    firstName: string;
    lastName?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  data: Order[];
}

export const useOrders = createQuery({
  queryKey: ['customer', 'orders'],
  fetcher: (): Promise<OrdersResponse> => api.get('orders'),
});
