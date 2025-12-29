import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { DashboardStatsParams, DashboardStatsResponse } from '../types';

export const useDashboardStats = createQuery({
  queryKey: ['admin', 'dashboard', 'stats'],
  fetcher: (params: DashboardStatsParams): Promise<DashboardStatsResponse> =>
    api.get('admin/dashboard/stats', { params }),
});
