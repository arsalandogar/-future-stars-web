import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useUserCards } from './get-user-cards';
import { useUserPacks } from './get-user-packs';

export interface DeleteCardParams {
  cardId: number;
  deleteFromGallery: boolean;
  deleteFromPacks: boolean;
}

export const useDeleteCard = createMutation({
  mutationFn: ({
    cardId,
    deleteFromGallery,
    deleteFromPacks,
  }: DeleteCardParams): Promise<void> =>
    api.delete(`cards/${cardId}`, {
      params: { deleteFromGallery, deleteFromPacks },
    }),
  use: [invalidateQueries([useUserCards.getKey(), useUserPacks.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Card deleted',
      message: 'Card has been deleted successfully.',
      color: 'green',
    });
  },
});
