import { useState } from 'react';
import { Loader, SimpleGrid, Text } from '@mantine/core';

import { ContentTabs } from '@/components/ui/content-tabs';

import type { ColorPreset } from '@/features/colors';

import type { ColorSubTab } from '../types';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import {
  useBrowseColorPresets,
  useBrowseColorLeagues,
} from '../api/browse-color-presets';
import { useColorFavorites } from '../api/color-favorites';
import { ColorPresetSwatch } from './color-preset-swatch';
import swatchStyles from './color-preset-swatch.module.css';

import styles from './color-source-tabs.module.css';

const SUB_TAB_ITEMS: { label: string; value: ColorSubTab }[] = [
  { label: 'Popular', value: 'popular' },
  { label: 'Team', value: 'team' },
  { label: 'My Colors', value: 'my-colors' },
];

interface SwatchGridProps {
  presets: ColorPreset[];
  appliedPresetId: number | null;
  showLabel?: boolean;
}

function SwatchGrid({ presets, appliedPresetId, showLabel }: SwatchGridProps) {
  return (
    <SimpleGrid cols={{ base: 3, xs: 4, sm: 5 }} spacing="sm">
      {presets.map((preset) => (
        <ColorPresetSwatch
          key={preset.id}
          preset={preset}
          selected={appliedPresetId === preset.id}
          showLabel={showLabel}
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
  const editableColorFields = useCardEditorStore((s) => s.editableColorFields);
  const edits = useCardEditorStore((s) => s.edits);
  const resetAllColors = useCardEditorStore((s) => s.resetAllColors);

  const originalColors = editableColorFields.map((f) => f.originalValue);
  const isOriginal = editableColorFields.every((f) => edits[f.fieldId] == null);

  return (
    <button
      type="button"
      className={swatchStyles.wrapper}
      onClick={resetAllColors}
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
  const { data, isLoading } = useBrowseColorPresets();
  const appliedPresetId = useCardEditorStore((s) => s.appliedPresetId);

  if (isLoading) return <LoadingState />;

  const featured = (data?.data ?? []).filter((p) => p.isFeatured);

  return (
    <SimpleGrid cols={{ base: 3, xs: 4, sm: 5 }} spacing="sm">
      <OriginalSwatch />
      {featured.map((preset) => (
        <ColorPresetSwatch
          key={preset.id}
          preset={preset}
          selected={appliedPresetId === preset.id}
        />
      ))}
    </SimpleGrid>
  );
}

function TeamContent() {
  const { data: leaguesData, isLoading: leaguesLoading } =
    useBrowseColorLeagues();
  const { data: presetsData, isLoading: presetsLoading } =
    useBrowseColorPresets();
  const appliedPresetId = useCardEditorStore((s) => s.appliedPresetId);
  const [activeLeagueId, setActiveLeagueId] = useState<number | null>(null);

  if (leaguesLoading || presetsLoading) return <LoadingState />;

  const leagues = leaguesData?.data ?? [];
  const presets = presetsData?.data ?? [];

  if (leagues.length === 0) {
    return <EmptyState message="No team colors available" />;
  }

  // Default to first league if none selected
  const selectedLeagueId = activeLeagueId ?? leagues[0]?.id ?? null;

  const filteredPresets = selectedLeagueId
    ? presets.filter((p) => p.colorLeagueId === selectedLeagueId)
    : [];

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
          >
            {league.label}
          </button>
        ))}
      </div>
      {filteredPresets.length === 0 ? (
        <EmptyState message="No team colors in this league" />
      ) : (
        <SwatchGrid
          presets={filteredPresets}
          appliedPresetId={appliedPresetId}
          showLabel
        />
      )}
    </>
  );
}

function MyColorsContent() {
  const { data, isLoading } = useColorFavorites();
  const appliedPresetId = useCardEditorStore((s) => s.appliedPresetId);

  if (isLoading) return <LoadingState />;

  const favorites = data?.data ?? [];

  if (favorites.length === 0) {
    return <EmptyState message="No saved colors yet" />;
  }

  return <SwatchGrid presets={favorites} appliedPresetId={appliedPresetId} />;
}

export function ColorSourceTabs() {
  const { activeColorSubTab, setActiveColorSubTab } = useCardBuilderStore();

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
