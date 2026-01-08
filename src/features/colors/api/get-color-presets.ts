import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type {
  ColorPresetsListParams,
  ColorPresetsListResponse,
} from '../types';

export const useColorPresets = createQuery({
  queryKey: ['admin', 'color-presets'],
  fetcher: (
    params: ColorPresetsListParams
  ): Promise<ColorPresetsListResponse> =>
    api.get('admin/color-presets', { params }),
});
