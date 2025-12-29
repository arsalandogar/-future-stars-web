import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { UsersListParams, UsersListResponse } from '../types';

export const useUsers = createQuery({
  queryKey: ['admin', 'users'],
  fetcher: (params: UsersListParams): Promise<UsersListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.role) searchParams.set('role', params.role);
    if (params.search) searchParams.set('search', params.search);

    const queryString = searchParams.toString();
    const url = queryString ? `admin/users?${queryString}` : 'admin/users';

    return api.get(url);
  },
});
