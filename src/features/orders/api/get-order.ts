import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { OrderResponse } from '../types';

export const useOrder = createQuery({
  queryKey: ['admin', 'orders', 'detail'],
  fetcher: (orderId: number): Promise<OrderResponse> =>
    api.get(`admin/orders/${orderId}`),
});
