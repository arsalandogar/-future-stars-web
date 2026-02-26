import { api } from '@/lib/api-client';
import {
  createMutation,
  createQuery,
  invalidateQueries,
} from '@/lib/react-query';

import type { ColorPreset } from '@/features/colors';

type ColorFavoritesResponse = { data: ColorPreset[] };

export const useColorFavorites = createQuery({
  queryKey: ['color-presets', 'favorites'],
  fetcher: (): Promise<ColorFavoritesResponse> =>
    api.get('color-presets/favorites'),
});

export const useAddColorFavorite = createMutation({
  mutationFn: async (params: { colorPresetId: number }): Promise<void> => {
    await api.post('color-presets/favorites', {
      color_preset_id: params.colorPresetId,
    });
  },
  use: [invalidateQueries([useColorFavorites.getKey()])],
});

export const useRemoveColorFavorite = createMutation({
  mutationFn: async (params: { id: number }): Promise<void> => {
    await api.delete(`color-presets/favorites/${params.id}`);
  },
  use: [invalidateQueries([useColorFavorites.getKey()])],
});
