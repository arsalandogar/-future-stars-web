import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTemplates } from './get-templates';
import { useTemplate } from './get-template';
import type { Template, UpdateTemplateParams } from '../types';

export const useUpdateTemplate = createMutation({
  mutationFn: ({ id, ...params }: UpdateTemplateParams): Promise<Template> =>
    api.put(`admin/templates/${id}`, params),
  use: [invalidateQueries([useTemplates.getKey(), useTemplate.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Template updated',
      message: 'Template has been updated successfully.',
      color: 'green',
    });
  },
});
