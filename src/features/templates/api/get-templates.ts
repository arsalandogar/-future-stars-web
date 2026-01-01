import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { TemplatesListParams, TemplatesListResponse } from '../types';

export const useTemplates = createQuery({
  queryKey: ['admin', 'templates'],
  fetcher: (params: TemplatesListParams): Promise<TemplatesListResponse> => {
    return api.get('templates', { params });
  },
});
