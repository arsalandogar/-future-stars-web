import { createCrudMutations } from '@/lib/react-query';

import type {
  ColorTeam,
  CreateColorTeamParams,
  UpdateColorTeamParams,
  League,
  CreateLeagueParams,
  UpdateLeagueParams,
} from '../types';
import { useColorTeams } from './get-color-teams';
import { useLeagues } from './get-leagues';

export const colorTeamMutations = createCrudMutations<
  CreateColorTeamParams,
  UpdateColorTeamParams,
  ColorTeam
>({
  endpoint: 'admin/color-teams',
  entityName: 'Color Team',
  listQueryKey: useColorTeams.getKey(),
});

export const leagueMutations = createCrudMutations<
  CreateLeagueParams,
  UpdateLeagueParams,
  League
>({
  endpoint: 'admin/leagues',
  entityName: 'League',
  listQueryKey: useLeagues.getKey(),
});
