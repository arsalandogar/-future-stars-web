import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  ColorPicker,
  ColorSwatch,
  Group,
  Popover,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Palette, Search } from 'lucide-react';

import { useColorTeams } from '@/features/colors';

import type { ColorAreaOption } from '../hooks/use-color-area-options';
import { useAnnotatorStore } from '../stores/annotator-store';

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
// Inline color picker popover (reused for BG and FG swatches)
// ---------------------------------------------------------------------------

function ColorSwatchPopover({
  color,
  label,
  onChange,
}: {
  color: string;
  label: string;
  onChange: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      opened={open}
      onChange={setOpen}
      position="bottom-end"
      shadow="md"
      width={220}
    >
      <Popover.Target>
        <ColorSwatch
          color={color}
          size={14}
          withShadow={false}
          style={{ cursor: 'pointer' }}
          onClick={() => setOpen((o) => !o)}
        />
      </Popover.Target>
      <Popover.Dropdown p="xs">
        <Text size="xs" fw={600} mb={4}>
          {label}
        </Text>
        <ColorPicker
          format="hex"
          value={color}
          onChange={onChange}
          size="sm"
          fullWidth
        />
      </Popover.Dropdown>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// Per-area palette item — BG swatch + FG swatch, both editable
// ---------------------------------------------------------------------------

function ColorAreaPaletteItem({ option }: { option: ColorAreaOption }) {
  const previewPair = useAnnotatorStore((s) =>
    s.previewColors.get(option.value)
  );
  const setPreviewColor = useAnnotatorStore((s) => s.setPreviewColor);
  const applyFgToColorArea = useAnnotatorStore((s) => s.applyFgToColorArea);
  const fieldId = option.value;

  const displayBg = previewPair?.bg ?? option.hex ?? '#888';
  const displayFg = previewPair?.fg ?? option.fgHex ?? '#ffffff';

  const handleBgChange = useCallback(
    (color: string) => {
      const currentFg =
        useAnnotatorStore.getState().previewColors.get(fieldId)?.fg ??
        option.fgHex ??
        '#ffffff';
      setPreviewColor(fieldId, { bg: color, fg: currentFg });
    },
    [fieldId, option.fgHex, setPreviewColor]
  );

  const handleFgChange = useCallback(
    (newFg: string) => {
      applyFgToColorArea(fieldId, newFg);
    },
    [fieldId, applyFgToColorArea]
  );

  return (
    <Group gap="xs" wrap="nowrap">
      <ColorSwatch color={displayBg} size={16} withShadow={false} />
      <Text size="xs" className="flex-1" truncate>
        {option.label}
      </Text>
      <Group gap={4} wrap="nowrap">
        <ColorSwatchPopover
          color={displayBg}
          label="Background"
          onChange={handleBgChange}
        />
        <ColorSwatchPopover
          color={displayFg}
          label="Text color"
          onChange={handleFgChange}
        />
      </Group>
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
  const hasAnyPreview = useAnnotatorStore((s) => s.previewColors.size > 0);
  const clearPreviewColors = useAnnotatorStore((s) => s.clearPreviewColors);

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
          <ColorAreaPaletteItem key={opt.value} option={opt} />
        ))}
      </Stack>
    </div>
  );
}
