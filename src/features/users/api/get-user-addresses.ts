import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { UserRelationParams, UserAddressesResponse } from '../types';

export const useUserAddresses = createQuery({
  queryKey: ['admin', 'users', 'addresses'],
  fetcher: ({
    userId,
    page,
    limit,
    search,
  }: UserRelationParams): Promise<UserAddressesResponse> =>
    api.get(`admin/users/${userId}/addresses`, {
      params: { page, limit, search },
    }),
});
