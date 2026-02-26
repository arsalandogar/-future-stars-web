import type { FeaturedItem } from '@/types';

import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

export interface CustomerFeaturedItemsResponse {
  data: FeaturedItem[];
}

export const customerFeaturedItemsQuery = createQuery({
  queryKey: ['customer', 'featured-items'],
  fetcher: (): Promise<CustomerFeaturedItemsResponse> =>
    api.get('featured-items'),
});
export const useCustomerFeaturedItems = customerFeaturedItemsQuery;
