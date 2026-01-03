import { createQuery } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import type { TagsListParams, TagsListResponse } from '../types';

export const useTags = createQuery({
  queryKey: ['admin', 'tags'],
  fetcher: (params: TagsListParams): Promise<TagsListResponse> =>
    api.get('tags', { params }),
});
