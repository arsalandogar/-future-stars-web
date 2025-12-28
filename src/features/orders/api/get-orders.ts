import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { OrdersListParams, OrdersListResponse } from '../types';

export const useOrders = createQuery({
  queryKey: ['admin', 'orders'],
  fetcher: (params: OrdersListParams): Promise<OrdersListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.userId) searchParams.set('userId', String(params.userId));
    if (params.status) searchParams.set('status', params.status);
    if (params.search) searchParams.set('search', params.search);

    const queryString = searchParams.toString();
    const url = queryString ? `admin/orders?${queryString}` : 'admin/orders';

    return api.get(url);
  },
});
