import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { BrowseTemplatesResponse } from '@/features/templates-browse';

export const useBuilderTemplates = createQuery({
  queryKey: ['templates', 'browse'],
  fetcher: (): Promise<BrowseTemplatesResponse> => api.get('templates/browse'),
  staleTime: 1000 * 60 * 10,
});
