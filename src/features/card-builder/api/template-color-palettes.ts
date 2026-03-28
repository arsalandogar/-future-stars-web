import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { ColorPalette } from '@/features/color-palettes';

type TemplateColorPalettesResponse = { data: ColorPalette[] };

export const useTemplateColorPalettes = createQuery({
  queryKey: ['templates', 'color-palettes'],
  fetcher: (templateId: number): Promise<TemplateColorPalettesResponse> =>
    api.get(`templates/${templateId}/color-palettes`),
  staleTime: 1000 * 60 * 10,
});
