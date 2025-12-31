import { createQuery } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import type { TagListResponse, TagsListParams } from '../types';

export const useTags = createQuery({
  queryKey: ['admin', 'tags'],
  fetcher: (params: TagsListParams): Promise<TagListResponse> => {
    return api.get('tags', { params });
  },
});
