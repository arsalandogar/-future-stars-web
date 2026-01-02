import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useColorLeagues } from './get-color-leagues';

export const useDeleteColorLeague = createMutation({
  mutationFn: (id: number): Promise<void> =>
    api.delete(`admin/color-leagues/${id}`),
  use: [invalidateQueries([useColorLeagues.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Color League deleted',
      message: 'Color League has been deleted successfully.',
      color: 'green',
    });
  },
});
