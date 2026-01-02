import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useColorPresets } from './get-color-presets';
import type { ColorPreset, CreateColorPresetParams } from '../types';

export const useCreateColorPreset = createMutation({
  mutationFn: (params: CreateColorPresetParams): Promise<ColorPreset> =>
    api.post('admin/color-presets', params),
  use: [invalidateQueries([useColorPresets.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Color Preset created',
      message: 'Color Preset has been created successfully.',
      color: 'green',
    });
  },
});
