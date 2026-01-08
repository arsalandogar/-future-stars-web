import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useColorLeagues } from './get-color-leagues';
import type { ColorLeague, UpdateColorLeagueParams } from '../types';

export const useUpdateColorLeague = createMutation({
  mutationFn: ({
    id,
    name,
    label,
    rank,
    isActive,
  }: UpdateColorLeagueParams): Promise<ColorLeague> =>
    api.put(`admin/color-leagues/${id}`, { name, label, rank, isActive }),
  use: [invalidateQueries([useColorLeagues.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Color League updated',
      message: 'Color League has been saved successfully.',
      color: 'green',
    });
  },
});
