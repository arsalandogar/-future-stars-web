import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type {
  ColorPalettesListParams,
  ColorPalettesListResponse,
} from '../types';

export const useColorPalettes = createQuery({
  queryKey: ['admin', 'color-palettes'],
  fetcher: (
    params: ColorPalettesListParams
  ): Promise<ColorPalettesListResponse> =>
    api.get('admin/color-palettes', { params }),
});
