import { useState } from 'react';
import { Badge, Group, Loader, Text, TextInput } from '@mantine/core';
import { Check, X } from 'lucide-react';

import {
  useColorPalette,
  useUpdateColorPalette,
  type ColorPair,
} from '@/features/color-palettes';
import type { ColorTeam } from '@/features/colors';

import { PaletteSection } from './palette-section';
import { ColorSchemeSection } from './color-scheme-section';

interface PaletteDetailPanelProps {
  paletteId: number | undefined;
  selectedTeam: ColorTeam | undefined;
  livePairs?: ColorPair[];
  onLivePairsChange?: (pairs: ColorPair[]) => void;
}

export function PaletteDetailPanel({
  paletteId,
  selectedTeam,
  livePairs,
  onLivePairsChange,
}: PaletteDetailPanelProps) {
  const { data, isLoading } = useColorPalette({
    variables: paletteId!,
    enabled: paletteId != null,
  });
  const updatePalette = useUpdateColorPalette();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [prevPaletteId, setPrevPaletteId] = useState(paletteId);

  // Reset editing state when palette changes (render-time adjustment)
  if (paletteId !== prevPaletteId) {
    setPrevPaletteId(paletteId);
    setIsEditingName(false);
  }

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

  const handleStartEditing = () => {
    setEditedName(palette.name);
    setIsEditingName(true);
  };

  const handleCancelEditing = () => {
    setIsEditingName(false);
  };

  const handleSaveName = () => {
    const trimmed = editedName.trim();
    if (!trimmed || trimmed === palette.name) {
      setIsEditingName(false);
      return;
    }
    updatePalette.mutate(
      { id: palette.id, name: trimmed },
      { onSuccess: () => setIsEditingName(false) }
    );
  };

  return (
    <div className="flex flex-col gap-md">
      <Group justify="space-between" wrap="nowrap">
        <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          {isEditingName ? (
            <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
              <TextInput
                value={editedName}
                onChange={(e) => setEditedName(e.currentTarget.value)}
                size="sm"
                autoFocus
                style={{ flex: 1, minWidth: 0 }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEditing();
                }}
              />
              <button
                type="button"
                className="flex items-center text-[var(--mantine-color-green-5)] hover:text-[var(--mantine-color-green-4)]"
                onClick={handleSaveName}
                title="Save"
              >
                <Check size={16} />
              </button>
              <button
                type="button"
                className="flex items-center text-[var(--mantine-color-red-5)] hover:text-[var(--mantine-color-red-4)]"
                onClick={handleCancelEditing}
                title="Cancel"
              >
                <X size={16} />
              </button>
            </Group>
          ) : (
            <>
              <Text fw={700} size="md" tt="uppercase">
                {palette.name}
              </Text>
              {selectedTeam?.league && (
                <Badge variant="light" size="sm">
                  {selectedTeam.league.label}
                </Badge>
              )}
            </>
          )}
        </Group>
        {!isEditingName && (
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
              onClick={handleStartEditing}
            >
              Edit
            </button>
          </Group>
        )}
      </Group>

      <PaletteSection
        colorPairs={palette.colorPairs}
        paletteId={palette.id}
        paletteName={palette.name}
        onLivePairsChange={onLivePairsChange}
      />

      <ColorSchemeSection
        colorPairs={livePairs ?? palette.colorPairs}
        paletteName={palette.name}
      />
    </div>
  );
}
