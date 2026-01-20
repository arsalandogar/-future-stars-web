import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { UserRelationParams, UserCartItemsResponse } from '../types';

export const useUserCartItems = createQuery({
  queryKey: ['admin', 'users', 'cartItems'],
  fetcher: ({
    userId,
    page,
    limit,
    search,
  }: UserRelationParams): Promise<UserCartItemsResponse> =>
    api.get(`admin/users/${userId}/cart-items`, {
      params: { page, limit, search },
    }),
});
