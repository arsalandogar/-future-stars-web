import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';
import type { Pack } from '@/types';

import { useCartItems } from './get-cart-items';
import { useUserPacks } from './get-user-packs';

export interface UpdatePackParams {
  id: number;
  name?: string;
  cards?: Array<{ cardId: number; quantity: number }>;
}

export const useUpdatePack = createMutation({
  mutationFn: ({ id, ...data }: UpdatePackParams): Promise<Pack> =>
    api.put(`packs/${id}`, data),
  use: [invalidateQueries([useUserPacks.getKey(), useCartItems.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Pack Updated',
      message: 'Pack has been updated successfully.',
      color: 'green',
    });
  },
});
