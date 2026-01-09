import type { FeaturedItem } from '../types';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';
import { useFeaturedItems } from './get-featured-items';

export const useReorderFeaturedItems = createMutation({
  mutationFn: (featuredItemIds: number[]): Promise<FeaturedItem[]> =>
    api.patch('admin/featured-items/reorder', { featuredItemIds }),
  use: [invalidateQueries([useFeaturedItems.getKey()])],
});
