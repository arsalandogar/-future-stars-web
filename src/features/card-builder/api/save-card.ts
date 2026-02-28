import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';
import type { Card } from '@/types';

import type { EditValue } from '@future-stars/card-engine';

interface SaveCardParams {
  templateId: number;
  editsJson: Record<string, EditValue>;
}

export const useSaveCard = createMutation({
  mutationFn: async (params: SaveCardParams): Promise<Card> => {
    const response: { data: Card } = await api.post('cards', {
      template_id: params.templateId,
      edits_json: params.editsJson,
    });
    return response.data;
  },
});
