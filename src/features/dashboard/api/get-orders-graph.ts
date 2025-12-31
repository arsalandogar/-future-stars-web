import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { GraphResponse } from '../types';

export const useOrdersGraph = createQuery({
  queryKey: ['admin', 'dashboard', 'orders-graph'],
  fetcher: (): Promise<GraphResponse> =>
    api.get('admin/dashboard/orders-graph'),
});
