// Pages
export { LeaguesListPage } from './pages/leagues-list-page';
export { ColorTeamsListPage } from './pages/color-teams-list-page';

// Components
export { LeaguesList } from './components/leagues-list';
export { ColorTeamsList } from './components/color-teams-list';

// API
export { useLeagues } from './api/get-leagues';
export { useCreateLeague } from './api/create-league';
export { useUpdateLeague } from './api/update-league';
export { useDeleteLeague } from './api/delete-league';
export { useColorTeams } from './api/get-color-teams';
export { useCreateColorTeam } from './api/create-color-team';
export { useUpdateColorTeam } from './api/update-color-team';
export { useDeleteColorTeam } from './api/delete-color-team';

// Types
export type {
  League,
  LeaguesListResponse,
  CreateLeagueParams,
  UpdateLeagueParams,
  TeamPalette,
  ColorTeam,
  ColorTeamsListResponse,
  ColorTeamsListParams,
  CreateColorTeamParams,
  UpdateColorTeamParams,
  PaletteOption,
} from './types';
