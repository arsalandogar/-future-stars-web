import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { Card } from '@/types';

export const useCard = createQuery({
  queryKey: ['customer', 'cards', 'detail'],
  fetcher: async (cardId: number): Promise<Card> => {
    const response: { data: Card } = await api.get(`cards/${cardId}`);
    return response.data;
  },
});
