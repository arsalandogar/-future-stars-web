import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTemplateColorPalettes } from './template-color-palettes';

interface ReorderTemplatePalettesParams {
  templateId: number;
  palettes: { colorPaletteId: number; rank: number }[];
}

export const useReorderTemplatePalettes = createMutation({
  mutationFn: ({
    templateId,
    palettes,
  }: ReorderTemplatePalettesParams): Promise<unknown> =>
    api.put(`admin/templates/${templateId}/color-palettes/reorder`, {
      palettes,
    }),
  use: [invalidateQueries([useTemplateColorPalettes.getKey()])],
});
