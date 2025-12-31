import { createMutation, invalidateQueries } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import { useTags } from './get-tags';
import type { Tag, CreateTagParam } from '../types';
import { notifications } from '@mantine/notifications';

export const useUpdateTag = createMutation({
  mutationFn: ({
    id,
    updatedTag,
  }: {
    id: string;
    updatedTag: CreateTagParam;
  }): Promise<Tag> => api.put(`admin/tags/${id}`, updatedTag),
  use: [invalidateQueries([useTags.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Tag update',
      message: 'Tag has been saved successfully.',
      color: 'green',
    });
  },
});
