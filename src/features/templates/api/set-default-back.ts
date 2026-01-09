import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import type { Template } from '../types';
import { useTemplates } from './get-templates';

export const useSetDefaultBack = createMutation({
  mutationFn: (id: number): Promise<Template> =>
    api.patch(`admin/templates/${id}/set-default-back`),
  use: [invalidateQueries([useTemplates.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Default back template set',
      message: 'Template has been set as the default back template.',
      color: 'green',
    });
  },
});
