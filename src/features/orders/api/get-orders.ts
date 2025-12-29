import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { OrdersListParams, OrdersListResponse } from '../types';

export const useOrders = createQuery({
  queryKey: ['admin', 'orders'],
  fetcher: (params: OrdersListParams): Promise<OrdersListResponse> => {
    return api.get('admin/orders', { params });
  },
});
