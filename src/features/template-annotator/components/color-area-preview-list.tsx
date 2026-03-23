import { useCallback, useMemo, useState } from 'react';
import { Button, ColorSwatch, Group, Select, Stack, Text } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Palette, Search } from 'lucide-react';

import { useColorTeams } from '@/features/colors';

import type { ColorAreaOption } from '../hooks/use-color-area-options';
import { useAnnotatorStore } from '../stores/annotator-store';
import { ColorPreviewPopover } from './color-preview-popover';

// ---------------------------------------------------------------------------
// Team Search Select
// ---------------------------------------------------------------------------

function TeamSearchSelect({
  colorAreaOptions,
}: {
  colorAreaOptions: ColorAreaOption[];
}) {
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const applyTeamPalette = useAnnotatorStore((s) => s.applyTeamPalette);
  const clearPreviewColors = useAnnotatorStore((s) => s.clearPreviewColors);

  const { data, isLoading } = useColorTeams({
    variables: { search: debounced || undefined, limit: 20 },
  });

  const teams = useMemo(
    () => (data?.data ?? []).filter((t) => t.userId == null),
    [data]
  );

  const options = useMemo(
    () =>
      teams.map((t) => ({
        value: String(t.id),
        label: `${t.name}${t.league ? ` (${t.league.label})` : ''}`,
      })),
    [teams]
  );

  const fieldIds = useMemo(
    () => colorAreaOptions.map((o) => o.value),
    [colorAreaOptions]
  );

  const handleSelect = useCallback(
    (value: string | null) => {
      if (!value) {
        clearPreviewColors();
        return;
      }
      const team = teams.find((t) => String(t.id) === value);
      const pairs = team?.palette?.colorPairs;
      if (!pairs?.length) return;

      const sorted = [...pairs].sort((a, b) => a.rank - b.rank);
      applyTeamPalette(sorted, fieldIds);
    },
    [teams, fieldIds, applyTeamPalette, clearPreviewColors]
  );

  return (
    <Select
      size="xs"
      placeholder="Search team..."
      searchable
      clearable
      searchValue={search}
      onSearchChange={setSearch}
      filter={({ options }) => options}
      nothingFoundMessage={isLoading ? 'Loading...' : 'No teams found'}
      data={options}
      onChange={handleSelect}
      leftSection={<Search size={12} />}
      renderOption={({ option }) => {
        const team = teams.find((t) => String(t.id) === option.value);
        const pairs = team?.palette?.colorPairs ?? [];
        return (
          <Group gap="xs" wrap="nowrap">
            <span className="flex-1 truncate">{option.label}</span>
            <Group gap={3} wrap="nowrap">
              {[...pairs]
                .sort((a, b) => a.rank - b.rank)
                .slice(0, 4)
                .map((p, i) => (
                  <ColorSwatch
                    key={i}
                    color={p.bg}
                    size={12}
                    withShadow={false}
                  />
                ))}
            </Group>
          </Group>
        );
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Per-area preview item
// ---------------------------------------------------------------------------

function ColorAreaPreviewItem({ option }: { option: ColorAreaOption }) {
  const previewColors = useAnnotatorStore((s) => s.previewColors);
  const fieldId = option.value;
  const previewPair = previewColors.get(fieldId);
  const previewBg = previewPair?.bg;

  const displayBg = previewBg ?? option.hex ?? '#888';
  const displayFg = previewPair?.fg ?? option.fgHex;

  return (
    <Group gap="xs" wrap="nowrap">
      <ColorSwatch color={displayBg} size={16} withShadow={false} />
      <Text size="xs" className="flex-1" truncate>
        {option.label}
      </Text>
      <Group gap={2} wrap="nowrap" style={{ width: 24 }}>
        <ColorSwatch color={displayBg} size={10} withShadow={false} />
        {displayFg ? (
          <ColorSwatch color={displayFg} size={10} withShadow={false} />
        ) : (
          <div style={{ width: 10 }} />
        )}
      </Group>
      <ColorPreviewPopover fieldId={fieldId} />
    </Group>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ColorAreaPreviewList({
  colorAreaOptions,
}: {
  colorAreaOptions: ColorAreaOption[];
}) {
  const previewColors = useAnnotatorStore((s) => s.previewColors);
  const clearPreviewColors = useAnnotatorStore((s) => s.clearPreviewColors);
  const hasAnyPreview = previewColors.size > 0;

  return (
    <div className="rounded-md bg-(--mantine-color-dark-6) p-2.5">
      <Group gap={6} mb="xs" justify="space-between">
        <Group gap={6}>
          <Palette size={12} color="var(--mantine-color-violet-5)" />
          <Text size="xs" fw={600} c="dimmed" tt="uppercase">
            Color Areas
          </Text>
        </Group>
        {hasAnyPreview && (
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            onClick={clearPreviewColors}
          >
            Clear all
          </Button>
        )}
      </Group>
      <Stack gap={8}>
        <TeamSearchSelect colorAreaOptions={colorAreaOptions} />
        {colorAreaOptions.map((opt) => (
          <ColorAreaPreviewItem key={opt.value} option={opt} />
        ))}
      </Stack>
    </div>
  );
}
