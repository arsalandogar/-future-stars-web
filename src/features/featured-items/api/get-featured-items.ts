import { createQuery } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import type {
  FeaturedItemListResponse,
  FeaturedItemsListParams,
} from '../types';

export const useFeaturedItems = createQuery({
  queryKey: ['admin', 'featured-items'],
  fetcher: (
    params: FeaturedItemsListParams
  ): Promise<FeaturedItemListResponse> => {
    return api.get('featured-items', { params });
  },
});
