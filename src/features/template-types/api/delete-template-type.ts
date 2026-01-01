import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTemplateTypes } from './get-template-types';

export const useDeleteTemplateType = createMutation({
  mutationFn: (id: number): Promise<void> =>
    api.delete(`admin/template-types/${id}`),
  use: [invalidateQueries([useTemplateTypes.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Template Type deleted',
      message: 'Template Type has been deleted successfully.',
      color: 'green',
    });
  },
});
