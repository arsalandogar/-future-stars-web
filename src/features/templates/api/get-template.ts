import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { TemplateResponse } from '../types';

export const templateQuery = createQuery({
  queryKey: ['admin', 'templates', 'detail'],
  fetcher: (id: number): Promise<TemplateResponse> => {
    return api.get(`templates/${id}`);
  },
});
export const useTemplate = templateQuery;
