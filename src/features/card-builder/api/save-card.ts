import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';
import type { Card } from '@/types';

import type { EditValue } from '@fs-card-engine';

interface SaveCardParams {
  templateId: number;
  editsJson: Record<string, EditValue>;
  backTemplateId: number | null;
  backEditsJson: Record<string, EditValue>;
}

export const useSaveCard = createMutation({
  mutationFn: async (params: SaveCardParams): Promise<Card> => {
    const response: { data: Card } = await api.post('cards', {
      template_id: params.templateId,
      edits_json: params.editsJson,
      back_template_id: params.backTemplateId,
      back_edits_json: params.backEditsJson,
    });
    return response.data;
  },
});
