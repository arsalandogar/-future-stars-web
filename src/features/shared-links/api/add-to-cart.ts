import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import type { AddToCartResponse } from '../types';

export const useSharedLinkAddToCart = createMutation({
  mutationFn: async (code: string): Promise<AddToCartResponse> => {
    const response: { data: AddToCartResponse } = await api.post(
      `shared-links/${code}/add-to-cart`
    );
    return response.data;
  },
  use: [invalidateQueries([['customer', 'cart-items']])],
});
