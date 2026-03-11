import { api } from '@/lib/api-client';
import { createMutation, seedQueryData } from '@/lib/react-query';
import type { Card } from '@/types';

import type { Edits } from '@fs-card-engine';

import { cardQuery } from './get-card';

interface SaveCardParams {
  templateId: number;
  editsJson: Edits;
  backTemplateId: number | null;
  backEditsJson: Edits;
}

export const useSaveCard = createMutation({
  mutationFn: async (params: SaveCardParams): Promise<Card> => {
    const response: { data: Card } = await api.post('cards/v2', params);
    return response.data;
  },
  use: [
    seedQueryData<Card, SaveCardParams>((card) => ({
      queryKey: cardQuery.getKey(card.id),
      data: card,
    })),
  ],
});
