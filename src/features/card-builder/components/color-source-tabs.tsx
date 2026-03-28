import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Loader, SimpleGrid, Text } from '@mantine/core';
import { useQueryClient } from '@tanstack/react-query';
import { GripVertical } from 'lucide-react';

import { ContentTabs } from '@/components/ui/content-tabs';
import type { ColorPalette } from '@/features/color-palettes';

import type { ColorSubTab } from '../types';
import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import {
  useBrowseColorTeams,
  useBrowseLeagues,
} from '../api/browse-color-teams';
import { useColorFavorites } from '../api/color-favorites';
import { useTemplateColorPalettes } from '../api/template-color-palettes';
import { useReorderTemplatePalettes } from '../api/reorder-template-palettes';
import { ColorPaletteSwatch } from './color-palette-swatch';
import swatchStyles from './color-palette-swatch.module.css';

import styles from './color-source-tabs.module.css';

const SUB_TAB_ITEMS: { label: string; value: ColorSubTab }[] = [
  { label: 'Popular', value: 'popular' },
  { label: 'Team', value: 'team' },
  { label: 'My Colors', value: 'my-colors' },
];

interface SwatchGridProps {
  items: {
    paletteId: number;
    colorPairs: { bg: string; fg: string }[];
    label?: string;
  }[];
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
          colorPairs={item.colorPairs}
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
        {editableColorFields.map((field) => (
          <div
            key={field.fieldId}
            className={swatchStyles.band}
            style={{ backgroundColor: field.originalValue }}
          />
        ))}
      </div>
      <span className={swatchStyles.label}>Original</span>
    </button>
  );
}

function SortableSwatch({
  palette,
  selected,
}: {
  palette: ColorPalette;
  selected: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: palette.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sortableItem}>
      <button
        type="button"
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={12} />
      </button>
      <ColorPaletteSwatch
        paletteId={palette.id}
        colorPairs={palette.colorPairs.map((c) => ({ bg: c.bg, fg: c.fg }))}
        selected={selected}
      />
    </div>
  );
}

function PopularContent() {
  const activeTemplateId = useCardBuilderStore((s) => s.activeTemplateId);
  const templateDefaultsId = useCardBuilderStore((s) => s.templateDefaultsId);
  const effectiveTemplateId = activeTemplateId ?? templateDefaultsId;
  const { data, isLoading } = useTemplateColorPalettes({
    variables: effectiveTemplateId ?? 0,
    enabled: effectiveTemplateId != null,
  });
  const appliedPresetId = useCardEditorStore(
    (s) => s.sides[s.activeSide].appliedPresetId
  );

  const queryClient = useQueryClient();
  const reorderMutation = useReorderTemplatePalettes();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const isPending = isLoading || (effectiveTemplateId != null && !data);
  if (isPending) return <LoadingState />;

  const palettes = data?.data ?? [];
  const canReorder = templateDefaultsId != null && palettes.length > 1;
  const items = palettes.map((p) => ({
    paletteId: p.id,
    colorPairs: p.colorPairs.map((c) => ({ bg: c.bg, fg: c.fg })),
  }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !effectiveTemplateId) return;

    const oldIndex = palettes.findIndex((p) => p.id === active.id);
    const newIndex = palettes.findIndex((p) => p.id === over.id);
    const newOrder = arrayMove(palettes, oldIndex, newIndex);

    // Optimistic update
    const queryKey = useTemplateColorPalettes.getKey(effectiveTemplateId);
    const previous = queryClient.getQueryData(queryKey);
    void queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData(queryKey, (old: typeof data) => {
      if (!old) return old;
      return { ...old, data: newOrder };
    });

    reorderMutation.mutate(
      {
        templateId: effectiveTemplateId,
        palettes: newOrder.map((p, i) => ({ colorPaletteId: p.id, rank: i })),
      },
      {
        onError: () => queryClient.setQueryData(queryKey, previous),
        onSettled: () => void queryClient.invalidateQueries({ queryKey }),
      }
    );
  };

  if (!canReorder) {
    return (
      <SwatchGrid items={items} appliedPresetId={appliedPresetId}>
        <OriginalSwatch />
      </SwatchGrid>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={palettes.map((p) => p.id)}
        strategy={rectSortingStrategy}
      >
        <SimpleGrid cols={{ base: 3, xs: 4, sm: 5 }} spacing="sm">
          <OriginalSwatch />
          {palettes.map((palette) => (
            <SortableSwatch
              key={palette.id}
              palette={palette}
              selected={appliedPresetId === palette.id}
            />
          ))}
        </SimpleGrid>
      </SortableContext>
    </DndContext>
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
    colorPairs:
      t.palette?.colorPairs.map((p) => ({ bg: p.bg, fg: p.fg })) ?? [],
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
    colorPairs: p.colorPairs.map((c) => ({ bg: c.bg, fg: c.fg })),
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
