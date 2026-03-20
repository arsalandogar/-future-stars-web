import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { colorPaletteQuery } from './get-color-palette';
import type { AttachTemplatePaletteParams } from '../types';

export const useAttachTemplatePalette = createMutation({
  mutationFn: ({
    paletteId,
    templateId,
    rank,
  }: AttachTemplatePaletteParams): Promise<{ message: string }> =>
    api.post(`admin/color-palettes/${paletteId}/templates`, {
      templateId,
      rank,
    }),
  use: [invalidateQueries([colorPaletteQuery.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Template attached',
      message: 'Template has been linked to the palette.',
      color: 'green',
    });
  },
});
