import { api } from '@/lib/api-client';
import { createMutation } from '@/lib/react-query';

import type { AddToCollectionResponse } from '../types';

export const useSharedLinkAddToCollection = createMutation({
  mutationFn: async (code: string): Promise<AddToCollectionResponse> => {
    const response: { data: AddToCollectionResponse } = await api.post(
      `shared-links/${code}/add-to-collection`
    );
    return response.data;
  },
});
