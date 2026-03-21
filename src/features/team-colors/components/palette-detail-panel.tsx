import { Badge, Group, Loader, Text } from '@mantine/core';

import { useColorPalette } from '@/features/color-palettes';
import type { ColorTeam } from '@/features/colors';

import { PaletteSection } from './palette-section';
import { ColorSchemeSection } from './color-scheme-section';

interface PaletteDetailPanelProps {
  paletteId: number | undefined;
  selectedTeam: ColorTeam | undefined;
}

export function PaletteDetailPanel({
  paletteId,
  selectedTeam,
}: PaletteDetailPanelProps) {
  const { data, isLoading } = useColorPalette({
    variables: paletteId!,
    enabled: paletteId != null,
  });

  if (paletteId == null) {
    return (
      <div className="flex items-center justify-center">
        <Text c="dimmed" size="sm">
          Select a palette to view details
        </Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-xl">
        <Loader size="sm" />
      </div>
    );
  }

  const palette = data?.data;
  if (!palette) return null;

  return (
    <div className="flex flex-col gap-md">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <Text fw={700} size="md" tt="uppercase">
            {palette.name}
          </Text>
          {selectedTeam?.league && (
            <Badge variant="light" size="sm">
              {selectedTeam.league.label}
            </Badge>
          )}
        </Group>
        <Group gap="md">
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide text-[var(--mantine-color-primary-4)] hover:underline"
          >
            Add +
          </button>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-wide text-[var(--mantine-color-primary-4)] hover:underline"
          >
            Edit
          </button>
        </Group>
      </Group>

      <PaletteSection colorPairs={palette.colorPairs} paletteId={palette.id} />

      <ColorSchemeSection
        colorPairs={palette.colorPairs}
        paletteName={palette.name}
      />
    </div>
  );
}
