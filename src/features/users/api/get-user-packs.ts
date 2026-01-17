import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { UserRelationParams, UserPacksResponse } from '../types';

export const useUserPacks = createQuery({
  queryKey: ['admin', 'users', 'packs'],
  fetcher: ({
    userId,
    page,
    limit,
    search,
  }: UserRelationParams): Promise<UserPacksResponse> =>
    api.get(`admin/users/${userId}/packs`, { params: { page, limit, search } }),
});
