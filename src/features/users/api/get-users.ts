import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { UsersListParams, UsersListResponse } from '../types';

export const useUsers = createQuery({
  queryKey: ['admin', 'users'],
  fetcher: (params: UsersListParams): Promise<UsersListResponse> => {
    return api.get('admin/users', { params });
  },
});
