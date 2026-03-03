import { notifications } from '@mantine/notifications';

import { api } from '@/lib/api-client';
import { createMutation, invalidateQueries } from '@/lib/react-query';

import type { SvgJsonNode } from '@/types/svg';

import { templateQuery } from './get-template';
import { useTemplateSvgJson } from './get-template-svg-json';

interface UpdateTemplateSvgJsonParams {
  id: number;
  svgJson: SvgJsonNode;
}

export const useUpdateTemplateSvgJson = createMutation({
  mutationFn: async (params: UpdateTemplateSvgJsonParams): Promise<void> => {
    await api.patch(`admin/templates/${params.id}/svg-json`, {
      svgJson: params.svgJson,
    });
  },
  use: [
    invalidateQueries([useTemplateSvgJson.getKey(), templateQuery.getKey()]),
  ],
  onSuccess: () => {
    notifications.show({
      title: 'SVG JSON saved',
      message: 'Template annotations have been saved successfully.',
      color: 'green',
    });
  },
});
