import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { BrowseTemplatesResponse } from '@/features/templates-browse';

export const useBuilderTemplates = createQuery({
  queryKey: ['card-builder', 'templates', 'browse'],
  fetcher: (): Promise<BrowseTemplatesResponse> => api.get('templates/browse'),
});
