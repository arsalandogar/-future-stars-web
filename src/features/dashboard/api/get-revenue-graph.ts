import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { GraphResponse } from '../types';

export const useRevenueGraph = createQuery({
  queryKey: ['admin', 'dashboard', 'revenue-graph'],
  fetcher: (): Promise<GraphResponse> =>
    api.get('admin/dashboard/revenue-graph'),
});
