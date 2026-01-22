import type { Order } from '@/features/orders/types';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useCartItems } from './get-cart-items';

export const useConfirmPayment = createMutation({
  mutationFn: (orderId: number): Promise<Order> =>
    api.patch(`orders/${orderId}/confirm-payment`),
  use: [invalidateQueries([useCartItems.getKey()])],
});
