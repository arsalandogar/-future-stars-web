import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useOrder } from './get-order';
import { useOrders } from './get-orders';
import type { Order, OrderStatus } from '../types';

interface UpdateOrderStatusParams {
  orderId: number;
  status: OrderStatus;
}

export const useUpdateOrderStatus = createMutation({
  mutationFn: ({ orderId, status }: UpdateOrderStatusParams): Promise<Order> =>
    api.put(`admin/orders/${orderId}`, { status }),
  use: [invalidateQueries([useOrders.getKey(), useOrder.getKey()])],
});
