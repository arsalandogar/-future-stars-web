import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { ConfigsListResponse } from '../types';

export const useConfigs = createQuery({
  queryKey: ['admin', 'configs'],
  fetcher: (): Promise<ConfigsListResponse> => api.get('admin/configs'),
});
