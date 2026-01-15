import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { BrowseTemplatesResponse } from '../types';

export const useBrowseTemplates = createQuery({
  queryKey: ['templates', 'browse'],
  fetcher: (): Promise<BrowseTemplatesResponse> => api.get('templates/browse'),
});
