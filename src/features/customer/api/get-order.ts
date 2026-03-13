import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';
import type { OrderCardSnapshot, OrderStatus } from '@/types';

interface OrderPackSnapshot {
  id: number;
  name: string;
  cardSnapshots: OrderCardSnapshot[];
}

export interface OrderLineItem {
  id: number;
  packId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  packName: string;
  packSnapshot: OrderPackSnapshot;
}

export interface Order {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  lineItems: OrderLineItem[];
  createdAt: string;
}

interface OrderResponse {
  data: Order;
}

export const useOrder = createQuery({
  queryKey: ['customer', 'order'],
  fetcher: async (orderId: number): Promise<Order> => {
    const response: OrderResponse = await api.get(`orders/${orderId}`);
    return response.data;
  },
});
