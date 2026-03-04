import type { PaginationMeta } from '@/types';

import { api } from '@/lib/api-client';
import {
  createInfiniteQuery,
  DEFAULT_PAGE,
  getNextPageParam,
} from '@/lib/react-query';

import type { BrowseTemplate } from '../types';

export interface TemplatesListParams {
  tagIds?: number[];
  limit?: number;
}

export interface TemplatesListResponse {
  data: BrowseTemplate[];
  meta: PaginationMeta;
}

export const useTemplates = createInfiniteQuery({
  queryKey: ['templates', 'list'],
  fetcher: (
    params: TemplatesListParams,
    { pageParam }
  ): Promise<TemplatesListResponse> =>
    api.get('templates', {
      params: { ...params, page: pageParam },
    }),
  getNextPageParam,
  initialPageParam: DEFAULT_PAGE,
});
