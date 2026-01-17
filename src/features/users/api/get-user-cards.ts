import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { UserRelationParams, UserCardsResponse } from '../types';

export const useUserCards = createQuery({
  queryKey: ['admin', 'users', 'cards'],
  fetcher: ({
    userId,
    page,
    limit,
    search,
  }: UserRelationParams): Promise<UserCardsResponse> =>
    api.get(`admin/users/${userId}/cards`, { params: { page, limit, search } }),
});
