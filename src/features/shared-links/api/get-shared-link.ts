import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { SharedLink } from '../types';

interface SharedLinkResponse {
  data: SharedLink;
}

export const useSharedLink = createQuery({
  queryKey: ['shared-links', 'detail'],
  fetcher: async (code: string): Promise<SharedLink> => {
    const response: SharedLinkResponse = await api.get(`shared-links/${code}`);
    return response.data;
  },
});
