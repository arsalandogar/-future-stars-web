import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { colorPaletteQuery } from './get-color-palette';
import type { DetachTemplatePaletteParams } from '../types';

export const useDetachTemplatePalette = createMutation({
  mutationFn: ({
    paletteId,
    templateId,
  }: DetachTemplatePaletteParams): Promise<void> =>
    api.delete(`admin/color-palettes/${paletteId}/templates/${templateId}`),
  use: [invalidateQueries([colorPaletteQuery.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Template detached',
      message: 'Template has been unlinked from the palette.',
      color: 'green',
    });
  },
});
