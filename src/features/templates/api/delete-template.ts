import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTemplates } from './get-templates';

export const useDeleteTemplate = createMutation({
  mutationFn: (id: number): Promise<void> =>
    api.delete(`admin/templates/${id}`),
  use: [invalidateQueries([useTemplates.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Template deleted',
      message: 'Template has been deleted successfully.',
      color: 'green',
    });
  },
});
