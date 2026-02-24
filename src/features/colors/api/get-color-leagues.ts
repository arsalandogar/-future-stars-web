import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type {
  ColorLeaguesListParams,
  ColorLeaguesListResponse,
} from '../types';

export const useColorLeagues = createQuery({
  queryKey: ['admin', 'color-leagues'],
  fetcher: (
    params: ColorLeaguesListParams
  ): Promise<ColorLeaguesListResponse> =>
    api.get('admin/color-leagues', { params }),
  staleTime: 1000 * 60 * 30,
});
