import type { CartItem } from '@/types';

import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

export interface CartItemsResponse {
  data: CartItem[];
}

export const useCartItems = createQuery({
  queryKey: ['customer', 'cart-items'],
  fetcher: async (): Promise<CartItemsResponse> => {
    const response: CartItemsResponse = await api.get('cart-items');
    // Filter out cart items where pack has packCards without a card
    return {
      ...response,
      data: response.data.map((item) => ({
        ...item,
        pack: {
          ...item.pack,
          packCards: item.pack.packCards.filter((pc) => pc.card != null),
        },
      })),
    };
  },
});
