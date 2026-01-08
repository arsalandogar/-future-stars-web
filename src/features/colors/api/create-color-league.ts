import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useColorLeagues } from './get-color-leagues';
import type { ColorLeague, CreateColorLeagueParams } from '../types';

export const useCreateColorLeague = createMutation({
  mutationFn: ({
    name,
    label,
    rank,
    isActive,
  }: CreateColorLeagueParams): Promise<ColorLeague> =>
    api.post('admin/color-leagues', { name, label, rank, isActive }),
  use: [invalidateQueries([useColorLeagues.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Color League created',
      message: 'Color League has been created successfully.',
      color: 'green',
    });
  },
});
