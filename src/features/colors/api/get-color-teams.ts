import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { ColorTeamsListParams, ColorTeamsListResponse } from '../types';

export const useColorTeams = createQuery({
  queryKey: ['admin', 'color-teams'],
  fetcher: (params: ColorTeamsListParams): Promise<ColorTeamsListResponse> =>
    api.get('admin/color-teams', { params }),
});
