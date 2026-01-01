import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import { useTemplateTypes } from './get-template-types';
import type { TemplateType, UpdateTemplateTypeParams } from '../types';

export const useUpdateTemplateType = createMutation({
  mutationFn: ({
    id,
    name,
    extraPrice,
  }: UpdateTemplateTypeParams): Promise<TemplateType> =>
    api.put(`admin/template-types/${id}`, { name, extraPrice }),
  use: [invalidateQueries([useTemplateTypes.getKey()])],
  onSuccess: () => {
    notifications.show({
      title: 'Template Type updated',
      message: 'Template Type has been saved successfully.',
      color: 'green',
    });
  },
});
