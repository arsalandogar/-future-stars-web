import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useColorPresets } from './get-color-presets';

export const useDeleteColorPreset = createMutation({
  mutationFn: (id: number): Promise<void> =>
    api.delete(`admin/color-presets/${id}`),
  use: [invalidateQueries([useColorPresets.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Color Preset deleted',
      message: 'Color Preset has been deleted successfully.',
      color: 'green',
    });
  },
});
