import type { Card } from '@/types';

import { api } from '@/lib/api-client';
import {
  createMutation,
  invalidateQueries,
  seedQueryData,
} from '@/lib/react-query';

import type { PersistCardPayload } from './save-card';
import { cardQuery } from './get-card';

export interface UpdateCardParams extends PersistCardPayload {
  id: number;
}

export const useUpdateCard = createMutation({
  mutationFn: async ({ id, ...data }: UpdateCardParams): Promise<Card> => {
    const response: { data: Card } = await api.put(`cards/v2/${id}`, data);
    return response.data;
  },
  use: [
    seedQueryData<Card, UpdateCardParams>((card) => ({
      queryKey: cardQuery.getKey(card.id),
      data: card,
    })),
    invalidateQueries([['customer', 'cards']]),
  ],
});
