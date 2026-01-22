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
  fetcher: async (params: UserPacksParams): Promise<UserPacksResponse> => {
    const response: UserPacksResponse = await api.get('packs', { params });
    // Filter out packCards that don't have a card (e.g., if the card was deleted)
    return {
      ...response,
      data: response.data.map((pack) => ({
        ...pack,
        packCards: pack.packCards.filter((pc) => pc.card != null),
      })),
    };
  },
  getNextPageParam: (lastPage) => {
    if (lastPage.meta.currentPage < lastPage.meta.lastPage) {
      return lastPage.meta.currentPage + 1;
    }
    return undefined;
  },
  initialPageParam: USER_PACKS_INITIAL_PAGE,
});
