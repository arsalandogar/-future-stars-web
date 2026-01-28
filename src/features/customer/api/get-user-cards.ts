import type { Card, PaginationMeta } from '@/types';

import { api } from '@/lib/api-client';
import { createInfiniteQuery } from '@/lib/react-query';

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

export const USER_CARDS_INITIAL_PAGE = 1;
export const USER_CARDS_DEFAULT_LIMIT = 20;

export const useUserCards = createInfiniteQuery({
  queryKey: ['customer', 'cards'],
  fetcher: (
    params: UserCardsParams,
    { pageParam }
  ): Promise<UserCardsResponse> =>
    api.get('cards', { params: { ...params, page: pageParam } }),
  getNextPageParam: (lastPage) => {
    if (lastPage.meta.currentPage < lastPage.meta.lastPage) {
      return lastPage.meta.currentPage + 1;
    }
    return undefined;
  },
  initialPageParam: USER_CARDS_INITIAL_PAGE,
});
