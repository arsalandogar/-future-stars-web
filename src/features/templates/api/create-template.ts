import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTemplates } from './get-templates';
import type { Template, CreateTemplateParams } from '../types';

export const useCreateTemplate = createMutation({
  mutationFn: (params: CreateTemplateParams): Promise<Template> =>
    api.post('admin/templates', params),
  use: [invalidateQueries([useTemplates.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Template created',
      message: 'Template has been created successfully.',
      color: 'green',
    });
  },
});
