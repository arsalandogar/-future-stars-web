// features/tags/api/use-tags-crud.ts
import { createQuery } from '@/lib/react-query';
import { api } from '@/lib/api-client';
import type { TagListResponse, TagsListParams } from '../types';

export const useTags = createQuery({
  queryKey: ['tags'],
  fetcher: (params: TagsListParams): Promise<TagListResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.set('page', String(params.page));
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.search) searchParams.set('search', params.search);

    const queryString = searchParams.toString();
    const url = queryString ? `tags?${queryString}` : 'tags';

    return api.get(url);
  },
});
