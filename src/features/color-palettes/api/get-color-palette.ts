import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { ColorPaletteResponse } from '../types';

export const colorPaletteQuery = createQuery({
  queryKey: ['admin', 'color-palettes', 'detail'],
  fetcher: (id: number): Promise<ColorPaletteResponse> =>
    api.get(`admin/color-palettes/${id}`),
});

export const useColorPalette = colorPaletteQuery;
