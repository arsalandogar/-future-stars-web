import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useCartItems } from './get-cart-items';
import { useUserPacks } from './get-user-packs';

export interface RemoveCardFromPackParams {
  packId: number;
  cardId: number;
}

export const useRemoveCardFromPack = createMutation({
  mutationFn: ({ packId, cardId }: RemoveCardFromPackParams): Promise<void> =>
    api.delete(`packs/${packId}/cards/${cardId}`),
  use: [invalidateQueries([useUserPacks.getKey(), useCartItems.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Card Removed',
      message: 'Card has been removed from the pack.',
      color: 'green',
    });
  },
});
