import { useState } from 'react';
import { Loader, SimpleGrid, Text } from '@mantine/core';

import { ContentTabs } from '@/components/ui/content-tabs';

import type { ColorSubTab } from '../types';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import {
  useBrowseColorTeams,
  useBrowseLeagues,
} from '../api/browse-color-teams';
import { useColorFavorites } from '../api/color-favorites';
import { ColorPaletteSwatch } from './color-palette-swatch';
import swatchStyles from './color-palette-swatch.module.css';

import styles from './color-source-tabs.module.css';

const SUB_TAB_ITEMS: { label: string; value: ColorSubTab }[] = [
  { label: 'Popular', value: 'popular' },
  { label: 'Team', value: 'team' },
  { label: 'My Colors', value: 'my-colors' },
];

interface SwatchGridProps {
  items: { paletteId: number; colors: string[]; label?: string }[];
  appliedPresetId: number | null;
  children?: React.ReactNode;
}

function SwatchGrid({ items, appliedPresetId, children }: SwatchGridProps) {
  return (
    <SimpleGrid cols={{ base: 3, xs: 4, sm: 5 }} spacing="sm">
      {children}
      {items.map((item) => (
        <ColorPaletteSwatch
          key={item.paletteId}
          paletteId={item.paletteId}
          colors={item.colors}
          selected={appliedPresetId === item.paletteId}
          label={item.label}
        />
      ))}
    </SimpleGrid>
  );
}

function LoadingState() {
  return (
    <div className={styles.loader}>
      <Loader color="white" size="md" />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <Text c="dimmed" ta="center" py="xl">
      {message}
    </Text>
  );
}

function OriginalSwatch() {
  const editableColorFields = useCardEditorStore(
    (s) => s.sides[s.activeSide].editableColorFields
  );
  const isOriginal = useCardEditorStore((s) =>
    s.sides[s.activeSide].editableColorFields.every(
      (f) => s.sides[s.activeSide].edits[f.fieldId] == null
    )
  );
  const resetAllColors = useCardEditorStore((s) => s.resetAllColors);

  const originalColors = editableColorFields.map((f) => f.originalValue);

  return (
    <button
      type="button"
      className={swatchStyles.wrapper}
      onClick={() => resetAllColors()}
      aria-label="Reset to original colors"
    >
      <div
        className={swatchStyles.swatch}
        data-selected={isOriginal || undefined}
      >
        {originalColors.map((color) => (
          <div
            key={color}
            className={swatchStyles.band}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span className={swatchStyles.label}>Original</span>
    </button>
  );
}

function PopularContent() {
  const { data, isLoading } = useBrowseColorTeams();
  const appliedPresetId = useCardEditorStore(
    (s) => s.sides[s.activeSide].appliedPresetId
  );

  if (isLoading) return <LoadingState />;

  const featured = (data?.data ?? []).filter((t) => t.isFeatured);
  const items = featured.map((t) => ({
    paletteId: t.colorPaletteId,
    colors: t.palette?.colorPairs.map((p) => p.bg) ?? [],
  }));

  return (
    <SwatchGrid items={items} appliedPresetId={appliedPresetId}>
      <OriginalSwatch />
    </SwatchGrid>
  );
}

function TeamContent() {
  const { data: leaguesData, isLoading: leaguesLoading } = useBrowseLeagues();
  const { data: teamsData, isLoading: teamsLoading } = useBrowseColorTeams();
  const appliedPresetId = useCardEditorStore(
    (s) => s.sides[s.activeSide].appliedPresetId
  );
  const [activeLeagueId, setActiveLeagueId] = useState<number | null>(null);

  if (leaguesLoading || teamsLoading) return <LoadingState />;

  const leagues = leaguesData?.data ?? [];
  const teams = teamsData?.data ?? [];

  if (leagues.length === 0) {
    return <EmptyState message="No team colors available" />;
  }

  // Default to first league if none selected
  const selectedLeagueId = activeLeagueId ?? leagues[0]?.id ?? null;

  const filtered = selectedLeagueId
    ? teams.filter((t) => t.leagueId === selectedLeagueId)
    : [];

  const items = filtered.map((t) => ({
    paletteId: t.colorPaletteId,
    colors: t.palette?.colorPairs.map((p) => p.bg) ?? [],
    label: t.abbreviation,
  }));

  return (
    <>
      <div className={styles.leaguePills}>
        {leagues.map((league) => (
          <button
            key={league.id}
            type="button"
            className={styles.leaguePill}
            data-active={selectedLeagueId === league.id || undefined}
            onClick={() => setActiveLeagueId(league.id)}
            aria-label={`Filter by ${league.label}`}
            aria-pressed={selectedLeagueId === league.id}
          >
            {league.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <EmptyState message="No team colors in this league" />
      ) : (
        <SwatchGrid items={items} appliedPresetId={appliedPresetId} />
      )}
    </>
  );
}

function MyColorsContent() {
  const { data, isLoading } = useColorFavorites();
  const appliedPresetId = useCardEditorStore(
    (s) => s.sides[s.activeSide].appliedPresetId
  );

  if (isLoading) return <LoadingState />;

  const favorites = data?.data ?? [];

  if (favorites.length === 0) {
    return <EmptyState message="No saved colors yet" />;
  }

  const items = favorites.map((p) => ({
    paletteId: p.id,
    colors: p.colorPairs.map((c) => c.bg),
  }));

  return <SwatchGrid items={items} appliedPresetId={appliedPresetId} />;
}

export function ColorSourceTabs() {
  const activeColorSubTab = useCardBuilderStore((s) => s.activeColorSubTab);
  const setActiveColorSubTab = useCardBuilderStore(
    (s) => s.setActiveColorSubTab
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.filters}>
        <ContentTabs
          items={SUB_TAB_ITEMS}
          activeValue={activeColorSubTab}
          onChange={(value) => setActiveColorSubTab(value as ColorSubTab)}
          gap="var(--mantine-spacing-md)"
        />
      </div>

      <div className={styles.grid}>
        {activeColorSubTab === 'popular' && <PopularContent />}
        {activeColorSubTab === 'team' && <TeamContent />}
        {activeColorSubTab === 'my-colors' && <MyColorsContent />}
      </div>
    </div>
  );
}
