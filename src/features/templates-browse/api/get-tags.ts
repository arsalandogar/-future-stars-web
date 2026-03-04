import type { Tag } from '@/types';

import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

interface TagsResponse {
  data: Tag[];
}

export const useTemplateTags = createQuery({
  queryKey: ['templates', 'tags'],
  fetcher: async (): Promise<Tag[]> => {
    const response: TagsResponse = await api.get('tags');
    return response.data;
  },
  staleTime: 1000 * 60 * 10,
});
