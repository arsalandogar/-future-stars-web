import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { ColorPresetsListResponse } from '../types';
import type { ColorLeaguesListParams } from '../../color-leagues/types';

export const useColorPresets = createQuery({
  queryKey: ['admin', 'color-presets'],
  fetcher: (
    params: ColorLeaguesListParams
  ): Promise<ColorPresetsListResponse> =>
    api.get('admin/color-presets', { params }),
});
