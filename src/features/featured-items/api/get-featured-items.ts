import { createQuery } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import type {
  FeaturedItemsListParams,
  FeaturedItemsListResponse,
} from '../types';

export const featuredItemsQuery = createQuery({
  queryKey: ['admin', 'featured-items'],
  fetcher: (
    params: FeaturedItemsListParams
  ): Promise<FeaturedItemsListResponse> =>
    api.get('featured-items', { params }),
});
export const useFeaturedItems = featuredItemsQuery;
