import { createMutation, invalidateQueries } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import { useTags } from './get-tags';
import type { Tag, CreateTagParam } from '../types';
import { notifications } from '@mantine/notifications';

export const useCreateTag = createMutation({
  mutationFn: (newTag: CreateTagParam): Promise<Tag> =>
    api.post('admin/tags', newTag),
  use: [invalidateQueries([useTags.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Tag created',
      message: 'Tag has been created successfully.',
      color: 'green',
    });
  },
});
