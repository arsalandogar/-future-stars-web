import { api } from '@/lib/api-client';
import {
  createMutation,
  createQuery,
  invalidateQueries,
} from '@/lib/react-query';

import type { ColorPalette } from '@/features/color-palettes';

type ColorFavoritesResponse = { data: ColorPalette[] };

export const useColorFavorites = createQuery({
  queryKey: ['color-teams', 'favorites'],
  fetcher: (): Promise<ColorFavoritesResponse> =>
    api.get('color-teams/favorites'),
});

export const useAddColorFavorite = createMutation({
  mutationFn: async (params: { colorPaletteId: number }): Promise<void> => {
    await api.post('color-teams/favorites', {
      colorPaletteId: params.colorPaletteId,
    });
  },
  use: [invalidateQueries([useColorFavorites.getKey()])],
});

export const useRemoveColorFavorite = createMutation({
  mutationFn: async (params: { id: number }): Promise<void> => {
    await api.delete(`color-teams/favorites/${params.id}`);
  },
  use: [invalidateQueries([useColorFavorites.getKey()])],
});
