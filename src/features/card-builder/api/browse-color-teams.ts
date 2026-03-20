import { api } from '@/lib/api-client';
import { createQuery } from '@/lib/react-query';

import type { ColorTeam, League } from '@/features/colors';

type BrowseColorTeamsResponse = { data: ColorTeam[] };
type BrowseLeaguesResponse = { data: League[] };

export const useBrowseColorTeams = createQuery({
  queryKey: ['color-teams', 'browse'],
  fetcher: (): Promise<BrowseColorTeamsResponse> => api.get('color-teams'),
  staleTime: 1000 * 60 * 10,
});

export const useBrowseLeagues = createQuery({
  queryKey: ['leagues', 'browse'],
  fetcher: (): Promise<BrowseLeaguesResponse> => api.get('leagues'),
  staleTime: 1000 * 60 * 30,
});
