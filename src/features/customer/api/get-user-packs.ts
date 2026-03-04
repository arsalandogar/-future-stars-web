import type { Pack, PaginationMeta } from '@/types';

import { api } from '@/lib/api-client';
import {
  createInfiniteQuery,
  DEFAULT_PAGE,
  getNextPageParam,
} from '@/lib/react-query';

interface UserPacksResponse {
  data: Pack[];
  meta: PaginationMeta;
}

export interface UserPacksParams {
  page?: number;
  limit?: number;
}

export const useUserPacks = createInfiniteQuery({
  queryKey: ['customer', 'packs'],
  fetcher: async (
    params: UserPacksParams,
    { pageParam }
  ): Promise<UserPacksResponse> => {
    const response: UserPacksResponse = await api.get('packs', {
      params: { ...params, page: pageParam },
    });
    // Filter out packCards that don't have a card (e.g., if the card was deleted)
    return {
      ...response,
      data: response.data.map((pack) => ({
        ...pack,
        packCards: pack.packCards.filter((pc) => pc.card != null),
      })),
    };
  },
  getNextPageParam,
  initialPageParam: DEFAULT_PAGE,
});
