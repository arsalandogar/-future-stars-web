import { api } from '@/lib/api-client';
import { createMutation } from 'react-query-kit';
import { useTags } from './get-tags';
import { invalidateQueries } from '@/lib/react-query';
import { notifications } from '@mantine/notifications';

export const useDeleteTag = createMutation({
  mutationFn: (id: string | number): Promise<void> =>
    api.delete(`admin/tags/${id}`),
  use: [invalidateQueries([useTags.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Tag Deleted',
      message: 'Tag has been saved successfully.',
      color: 'green',
    });
  },
});
