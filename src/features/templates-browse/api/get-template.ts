import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { BrowseTemplate } from '../types';

interface TemplateResponse {
  data: BrowseTemplate;
}

export const useTemplate = createQuery({
  queryKey: ['templates', 'detail'],
  fetcher: async (id: number): Promise<BrowseTemplate> => {
    const response: TemplateResponse = await api.get(`templates/${id}`);
    return response.data;
  },
  staleTime: 1000 * 60 * 10,
});
