import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useColorPresets } from './get-color-presets';
import type { ColorPreset, UpdateColorPresetParams } from '../types';

export const useUpdateColorPreset = createMutation({
  mutationFn: ({
    id,
    ...params
  }: UpdateColorPresetParams): Promise<ColorPreset> =>
    api.put(`admin/color-presets/${id}`, params),
  use: [invalidateQueries([useColorPresets.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Color Preset updated',
      message: 'Color Preset has been saved successfully.',
      color: 'green',
    });
  },
});
