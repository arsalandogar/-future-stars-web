import type { Card, PaginationMeta } from '@/types';

import { api } from '@/lib/api-client';
import {
  createInfiniteQuery,
  DEFAULT_PAGE,
  getNextPageParam,
} from '@/lib/react-query';

export type { Card };

interface UserCardsResponse {
  data: Card[];
  meta: PaginationMeta;
}

export interface UserCardsParams {
  page?: number;
  limit?: number;
  includeIds?: number[];
  excludeIds?: number[];
}

export const useUserCards = createInfiniteQuery({
  queryKey: ['customer', 'cards'],
  fetcher: (
    params: UserCardsParams,
    { pageParam }
  ): Promise<UserCardsResponse> =>
    api.get('cards', { params: { ...params, page: pageParam } }),
  getNextPageParam,
  initialPageParam: DEFAULT_PAGE,
});
