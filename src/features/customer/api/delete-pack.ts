import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useCartItems } from './get-cart-items';
import { useUserPacks } from './get-user-packs';

export const useDeletePack = createMutation({
  mutationFn: (id: number): Promise<void> => api.delete(`packs/${id}`),
  use: [invalidateQueries([useUserPacks.getKey(), useCartItems.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Pack Deleted',
      message: 'Pack has been deleted successfully.',
      color: 'green',
    });
  },
});
