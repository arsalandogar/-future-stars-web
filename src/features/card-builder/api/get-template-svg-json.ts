import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { SvgJsonNode } from '../types';

export const useTemplateSvgJson = createQuery({
  queryKey: ['card-builder', 'template-svg-json'],
  fetcher: async (id: number): Promise<SvgJsonNode> => {
    const response: { data: SvgJsonNode } = await api.get(
      `templates/${id}/svg-json`
    );
    return response.data;
  },
});
