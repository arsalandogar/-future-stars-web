import type { Pack, PaginationMeta } from '@/types';

import { api } from '@/lib/api-client';
import { createInfiniteQuery } from '@/lib/react-query';

interface UserPacksResponse {
  data: Pack[];
  meta: PaginationMeta;
}

export interface UserPacksParams {
  page?: number;
  limit?: number;
}

export const USER_PACKS_INITIAL_PAGE = 1;
export const USER_PACKS_DEFAULT_LIMIT = 20;

export const useUserPacks = createInfiniteQuery({
  queryKey: ['customer', 'packs'],
  fetcher: (params: UserPacksParams): Promise<UserPacksResponse> =>
    api.get('packs', { params }),
  getNextPageParam: (lastPage) => {
    if (lastPage.meta.currentPage < lastPage.meta.lastPage) {
      return lastPage.meta.currentPage + 1;
    }
    return undefined;
  },
  initialPageParam: USER_PACKS_INITIAL_PAGE,
});
