import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';
import type { CardPreviewStatus, OrderStatus } from '@/types';

export interface CardSnapshot {
  id: number;
  originalCardId: number;
  quantity: number;
  frontCardImage: string | null;
  backCardImage: string | null;
  svgString: string | null;
  backSvgString: string | null;
  status: CardPreviewStatus;
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
