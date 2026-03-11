import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

import type { CreateSharedLinkParams, SharedLink } from '../types';

interface CreateSharedLinkResponse {
  data: SharedLink;
}

export const useCreateSharedLink = createMutation({
  mutationFn: async (params: CreateSharedLinkParams): Promise<SharedLink> => {
    const response: CreateSharedLinkResponse = await api.post(
      'shared-links',
      params
    );
    return response.data;
  },
});
