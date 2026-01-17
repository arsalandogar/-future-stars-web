import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';
import type { UserResponse } from '../types';

export const useUser = createQuery({
  queryKey: ['admin', 'users', 'detail'],
  fetcher: (id: number): Promise<UserResponse> => {
    return api.get(`admin/users/${id}`);
  },
});
