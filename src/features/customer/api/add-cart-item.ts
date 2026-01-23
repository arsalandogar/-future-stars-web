import type { CartItem } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useCartItems } from './get-cart-items';

interface AddCartItemParams {
  packId: number;
  quantity: number;
}

interface AddCartItemResponse {
  data: CartItem;
}

export const useAddCartItem = createMutation({
  mutationFn: (params: AddCartItemParams): Promise<AddCartItemResponse> =>
    api.post('cart-items', params),
  use: [invalidateQueries([useCartItems.getKey()])],
});
