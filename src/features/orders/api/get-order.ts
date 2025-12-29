import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { Order } from '../types';

export const useOrder = createQuery({
  queryKey: ['admin', 'order'],
  fetcher: (orderId: number): Promise<Order> =>
    api.get(`admin/orders/${orderId}`),
});
