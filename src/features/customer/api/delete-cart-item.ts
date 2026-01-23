import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

export const useDeleteCartItem = createMutation({
  mutationFn: (id: number): Promise<void> => api.delete(`cart-items/${id}`),
  // No invalidation - cache is updated optimistically in useCartQuantity hook
  onSuccess: () => {
    notifications.show({
      title: 'Item Removed',
      message: 'Pack has been removed from your cart.',
      color: 'green',
    });
  },
});
