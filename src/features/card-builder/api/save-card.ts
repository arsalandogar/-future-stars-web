import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';
import type { Card } from '@/types';

import type { Edits } from '@fs-card-engine';

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
});
