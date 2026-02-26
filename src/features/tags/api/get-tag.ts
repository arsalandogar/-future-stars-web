import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';
import type { TagDetailResponse } from '../types';

export const tagQuery = createQuery({
  queryKey: ['admin', 'tags', 'detail'],
  fetcher: (id: number): Promise<TagDetailResponse> => api.get(`tags/${id}`),
});
export const useTag = tagQuery;
