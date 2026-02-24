import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { TemplateTypesListResponse } from '../types';

export const useTemplateTypes = createQuery({
  queryKey: ['admin', 'template-types'],
  fetcher: (): Promise<TemplateTypesListResponse> =>
    api.get('admin/template-types'),
  staleTime: 1000 * 60 * 30,
});
