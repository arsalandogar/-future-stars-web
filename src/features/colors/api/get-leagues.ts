import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { LeaguesListResponse } from '../types';

export const useLeagues = createQuery({
  queryKey: ['admin', 'leagues'],
  fetcher: (): Promise<LeaguesListResponse> => api.get('admin/leagues'),
  staleTime: 1000 * 60 * 30,
});
