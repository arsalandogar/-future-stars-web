import { createMutation, invalidateQueries } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import { notifications } from '@mantine/notifications';

import { useTemplates } from './get-templates';
import type { SetTagsParams, SetTagsResponse } from '../types';

export const useSetTags = createMutation({
  mutationFn: (params: SetTagsParams): Promise<SetTagsResponse[]> =>
    api.post('admin/templates/set-tags', params),
  use: [invalidateQueries([useTemplates.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Tags updated',
      message: 'Template tags have been updated successfully.',
      color: 'green',
    });
  },
});
