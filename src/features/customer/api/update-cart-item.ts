import type { CartItem } from '@/types';

import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

export interface UpdateCartItemParams {
  id: number;
  quantity: number;
}

export const useUpdateCartItem = createMutation({
  mutationFn: ({ id, quantity }: UpdateCartItemParams): Promise<CartItem> =>
    api.put(`cart-items/${id}`, { quantity }),
  // No invalidation - cache is updated optimistically in useCartQuantity hook
  // Error handling also done in hook to refetch on failure
});
