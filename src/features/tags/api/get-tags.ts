import { createQuery } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import type { TagsListParams } from '../types';
import type { Tag } from '@/types';

export const useTags = createQuery({
  queryKey: ['admin', 'tags'],
  fetcher: (params: TagsListParams): Promise<Tag[]> => {
    return api.get('tags', { params });
  },
});
