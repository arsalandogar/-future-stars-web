import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTemplateTypes } from './get-template-types';
import type { TemplateType, CreateTemplateTypeParams } from '../types';

export const useCreateTemplateType = createMutation({
  mutationFn: ({
    name,
    extraPrice,
  }: CreateTemplateTypeParams): Promise<TemplateType> =>
    api.post('admin/template-types', { name, extraPrice }),
  use: [invalidateQueries([useTemplateTypes.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Template Type created',
      message: 'Template Type has been created successfully.',
      color: 'green',
    });
  },
});
