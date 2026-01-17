import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { UserRelationParams, UserOrdersResponse } from '../types';

export const useUserOrders = createQuery({
  queryKey: ['admin', 'users', 'orders'],
  fetcher: ({
    userId,
    page,
    limit,
    search,
  }: UserRelationParams): Promise<UserOrdersResponse> =>
    api.get(`admin/users/${userId}/orders`, {
      params: { page, limit, search },
    }),
});
