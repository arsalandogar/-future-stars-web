import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { ColorPreset, ColorLeague } from '@/features/colors';

type BrowseColorPresetsResponse = { data: ColorPreset[] };
type BrowseColorLeaguesResponse = { data: ColorLeague[] };

export const useBrowseColorPresets = createQuery({
  queryKey: ['color-presets', 'browse'],
  fetcher: (): Promise<BrowseColorPresetsResponse> => api.get('color-presets'),
  staleTime: 1000 * 60 * 10,
});

export const useBrowseColorLeagues = createQuery({
  queryKey: ['color-leagues', 'browse'],
  fetcher: (): Promise<BrowseColorLeaguesResponse> => api.get('color-leagues'),
  staleTime: 1000 * 60 * 30,
});
