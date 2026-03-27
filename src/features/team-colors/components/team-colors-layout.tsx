import { useEffect, useMemo, useRef, useState } from 'react';
import { CloseButton, TextInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { getRouteApi } from '@tanstack/react-router';
import { Search } from 'lucide-react';

import type { ColorPair } from '@/features/color-palettes';
import { useLeagues, useColorTeams } from '@/features/colors';
import { ListingPagination } from '@/components/ui/listing';

import { ColorTypeToggle } from './color-type-toggle';
import { LeagueFilterPills } from './league-filter-pills';
import { PaletteSidebar } from './palette-sidebar';
import { PaletteDetailPanel } from './palette-detail-panel';
import { TemplatePreviewGrid } from './template-preview-grid';
import styles from './team-colors-layout.module.css';

const routeApi = getRouteApi('/_authenticated/admin/team-colors');

export function TeamColorsLayout() {
  const {
    colorType,
    search,
    leagueFilter,
    paletteId,
    teamPage,
    teamLimit,
    templateSide,
    templateView,
    templateIndex,
  } = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const leagueId =
    leagueFilter === 'all' || leagueFilter === 'popular'
      ? undefined
      : leagueFilter;

  const { data: leaguesData } = useLeagues();
  const { data: teamsData, isLoading: teamsLoading } = useColorTeams({
    variables: {
      search: search || undefined,
      leagueId,
      featured: leagueFilter === 'popular' ? true : undefined,
      page: teamPage,
      limit: teamLimit,
    },
  });

  const leagues = leaguesData?.data ?? [];
  // Filter out user-created color teams (userId set, no league)
  const teams = useMemo(
    () => (teamsData?.data ?? []).filter((t) => t.userId == null),
    [teamsData?.data]
  );
  const teamsMeta = teamsData?.meta;
  const selectedTeam = teams.find((t) => t.colorPaletteId === paletteId);
  const apiColorPairs = useMemo(
    () => selectedTeam?.palette?.colorPairs ?? [],
    [selectedTeam?.palette?.colorPairs]
  );

  // Track user edits separately — null means "no edits, use API data".
  // This avoids the useState+useEffect sync delay that caused livePairs
  // to be [] for a render cycle when apiColorPairs updated.
  const [editedPairs, setEditedPairs] = useState<ColorPair[] | null>(null);
  const [prevPaletteId, setPrevPaletteId] = useState(paletteId);
  const livePairs = editedPairs ?? apiColorPairs;

  // Clear edits when switching palettes (render-time adjustment)
  if (paletteId !== prevPaletteId) {
    setPrevPaletteId(paletteId);
    setEditedPairs(null);
  }

  // Auto-select first team when none is selected
  useEffect(() => {
    if (paletteId == null && teams.length > 0) {
      void navigate({
        search: (prev) => ({ ...prev, paletteId: teams[0].colorPaletteId }),
        replace: true,
      });
    }
  }, [paletteId, teams, navigate]);

  const searchRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = useDebouncedCallback((value: string) => {
    void navigate({
      search: (prev) => ({ ...prev, search: value || undefined }),
      replace: true,
    });
  }, 300);

  const handleSearchClear = () => {
    if (searchRef.current) {
      searchRef.current.value = '';
    }
    handleSearchChange('');
    handleSearchChange.flush();
  };

  const handleLeagueFilterChange = (value: 'all' | 'popular' | number) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        leagueFilter: value === 'all' ? undefined : value,
      }),
    });
  };

  const handlePaletteSelect = (id: number) => {
    void navigate({
      search: (prev) => ({ ...prev, paletteId: id }),
    });
  };

  const handleColorTypeChange = (value: 'colors' | 'text') => {
    void navigate({
      search: (prev) => ({
        ...prev,
        colorType: value === 'colors' ? undefined : value,
      }),
    });
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.topControls}>
        <div className={styles.leftHeader}>
          <ColorTypeToggle value={colorType} onChange={handleColorTypeChange} />
          <TextInput
            ref={searchRef}
            placeholder="Search palettes..."
            leftSection={<Search size={16} />}
            rightSection={
              search ? (
                <CloseButton size="sm" onClick={handleSearchClear} />
              ) : null
            }
            defaultValue={search}
            onChange={(e) => handleSearchChange(e.currentTarget.value)}
            style={{ width: 260 }}
          />
        </div>

        <LeagueFilterPills
          leagues={leagues}
          activeFilter={leagueFilter}
          onChange={handleLeagueFilterChange}
        />
      </div>

      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <div className={styles.leftBody}>
            <div className={styles.sidebarColumn}>
              <PaletteSidebar
                teams={teams}
                loading={teamsLoading}
                selectedPaletteId={paletteId}
                colorType={colorType}
                onSelect={handlePaletteSelect}
              />
            </div>
            <div className={styles.detailColumn}>
              <PaletteDetailPanel
                paletteId={paletteId}
                selectedTeam={selectedTeam}
                livePairs={livePairs}
                onLivePairsChange={setEditedPairs}
              />
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <TemplatePreviewGrid
            side={templateSide}
            onSideChange={(side) =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  templateSide: side === 'all' ? undefined : side,
                }),
              })
            }
            colorPairs={livePairs}
            view={templateView}
            onViewChange={(view) =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  templateView: view === 'grid' ? undefined : view,
                  templateIndex:
                    view === 'grid' ? undefined : prev.templateIndex,
                }),
                replace: true,
              })
            }
            templateIndex={templateIndex}
            onTemplateIndexChange={(index) =>
              void navigate({
                search: (prev) => ({
                  ...prev,
                  templateIndex: index === 0 ? undefined : index,
                }),
              })
            }
          />
        </div>
      </div>

      {teamsMeta && (
        <ListingPagination
          meta={teamsMeta}
          limit={teamLimit}
          onPageChange={(page) =>
            void navigate({
              search: (prev) => ({ ...prev, teamPage: page }),
            })
          }
          onLimitChange={(limit) =>
            void navigate({
              search: (prev) => ({
                ...prev,
                teamLimit: limit,
                teamPage: 1,
              }),
            })
          }
        />
      )}
    </div>
  );
}
