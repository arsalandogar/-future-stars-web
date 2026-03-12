import { api } from '@/lib/api-client';
import {
  createMutation,
  invalidateQueries,
  seedQueryData,
} from '@/lib/react-query';
import type { Card } from '@/types';

import type { Edits } from '@fs-card-engine';

import { cardQuery } from './get-card';

export interface PersistCardPayload {
  templateId: number;
  editsJson: Edits;
  backTemplateId: number | null;
  backEditsJson: Edits;
}

export const useSaveCard = createMutation({
  mutationFn: async (params: PersistCardPayload): Promise<Card> => {
    const response: { data: Card } = await api.post('cards/v2', params);
    return response.data;
  },
  use: [
    seedQueryData<Card, PersistCardPayload>((card) => ({
      queryKey: cardQuery.getKey(card.id),
      data: card,
    })),
    invalidateQueries([['customer', 'cards']]),
  ],
});
