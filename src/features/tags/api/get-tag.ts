import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';
import type { TagDetailResponse } from '../types';

export const useTag = createQuery({
  queryKey: ['admin', 'tag'],
  fetcher: (id: number): Promise<TagDetailResponse> => api.get(`tags/${id}`),
});
