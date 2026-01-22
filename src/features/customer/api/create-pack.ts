import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';
import type { Pack } from '@/types';

import { useUserPacks } from './get-user-packs';

export interface CreatePackParams {
  name?: string;
  cards: Array<{ cardId: number; quantity: number }>;
}

interface CreatePackResponse {
  data: Pack;
}

export const useCreatePack = createMutation({
  mutationFn: async (data: CreatePackParams): Promise<Pack> => {
    const response: CreatePackResponse = await api.post('packs', data);
    return response.data;
  },
  use: [invalidateQueries([useUserPacks.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Pack Created',
      message: 'Pack has been created successfully.',
      color: 'green',
    });
  },
});
