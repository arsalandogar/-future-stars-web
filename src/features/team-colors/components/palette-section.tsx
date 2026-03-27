import { useState } from 'react';
import {
  ActionIcon,
  Button,
  ColorPicker,
  ColorSwatch,
  Group,
  Popover,
  Text,
  Tooltip,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { ArrowLeftRight, Plus, RotateCcw } from 'lucide-react';

import {
  useUpdateColorPalette,
  type ColorPair,
} from '@/features/color-palettes';

interface PaletteSectionProps {
  colorPairs: ColorPair[];
  paletteId: number;
  paletteName: string;
  onLivePairsChange?: (pairs: ColorPair[]) => void;
}

export function PaletteSection({
  colorPairs,
  paletteId,
  paletteName,
  onLivePairsChange,
}: PaletteSectionProps) {
  const [localPairs, setLocalPairs] = useState<ColorPair[]>(colorPairs);
  const [prevColorPairs, setPrevColorPairs] = useState(colorPairs);
  const [editingIndex, setEditingIndex] = useState<{
    index: number;
    field: 'bg' | 'fg';
  } | null>(null);
  const updatePalette = useUpdateColorPalette();

  // Sync local state when the source palette changes (render-time adjustment)
  if (colorPairs !== prevColorPairs) {
    setPrevColorPairs(colorPairs);
    setLocalPairs(colorPairs);
  }

  const isDirty = JSON.stringify(localPairs) !== JSON.stringify(colorPairs);

  // Helper: update local pairs and notify parent in one batch (avoids effect cascade)
  const updatePairs = (next: ColorPair[]) => {
    setLocalPairs(next);
    onLivePairsChange?.(next);
  };

  const handleColorChange = (
    index: number,
    field: 'bg' | 'fg',
    color: string
  ) => {
    updatePairs(
      localPairs.map((p, i) => (i === index ? { ...p, [field]: color } : p))
    );
  };

  const handleSwap = (index: number) => {
    updatePairs(
      localPairs.map((p, i) => (i === index ? { ...p, bg: p.fg, fg: p.bg } : p))
    );
  };

  const handleReset = (index: number) => {
    if (index >= colorPairs.length) return; // newly-added pair has no original to reset to
    updatePairs(
      localPairs.map((p, i) => (i === index ? colorPairs[index] : p))
    );
  };

  const handleAdd = () => {
    updatePairs([
      ...localPairs,
      { bg: '#5046FF', fg: '#FFFFFF', rank: localPairs.length },
    ]);
  };

  const handleSave = () => {
    modals.openConfirmModal({
      title: <Text fw={700}>Update Palette</Text>,
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to update the color palette for{' '}
          <strong>{paletteName}</strong>? This will affect all cards using this
          palette.
        </Text>
      ),
      labels: { confirm: 'Update', cancel: 'Cancel' },
      confirmProps: { color: 'primary' },
      onConfirm: () => {
        updatePalette.mutate({ id: paletteId, colorPairs: localPairs });
      },
    });
  };

  return (
    <div className="flex flex-col gap-sm">
      <Group justify="space-between">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Palette
        </Text>
      </Group>

      {localPairs.map((pair, index) => (
        <Group key={index} gap="xs" wrap="nowrap">
          <Popover
            opened={
              editingIndex?.index === index && editingIndex.field === 'bg'
            }
            onChange={(opened) => !opened && setEditingIndex(null)}
          >
            <Popover.Target>
              <ColorSwatch
                color={pair.bg}
                size={28}
                style={{ cursor: 'pointer' }}
                onClick={() => setEditingIndex({ index, field: 'bg' })}
              />
            </Popover.Target>
            <Popover.Dropdown>
              <ColorPicker
                format="hex"
                value={pair.bg}
                onChange={(color) => handleColorChange(index, 'bg', color)}
              />
            </Popover.Dropdown>
          </Popover>

          <ActionIcon
            variant="subtle"
            size="xs"
            onClick={() => handleSwap(index)}
            title="Swap colors"
          >
            <ArrowLeftRight size={12} />
          </ActionIcon>

          <Popover
            opened={
              editingIndex?.index === index && editingIndex.field === 'fg'
            }
            onChange={(opened) => !opened && setEditingIndex(null)}
          >
            <Popover.Target>
              <ColorSwatch
                color={pair.fg}
                size={28}
                style={{ cursor: 'pointer' }}
                onClick={() => setEditingIndex({ index, field: 'fg' })}
              />
            </Popover.Target>
            <Popover.Dropdown>
              <ColorPicker
                format="hex"
                value={pair.fg}
                onChange={(color) => handleColorChange(index, 'fg', color)}
              />
            </Popover.Dropdown>
          </Popover>

          <ActionIcon
            variant="subtle"
            size="xs"
            onClick={() => handleReset(index)}
            title="Reset pair"
          >
            <RotateCcw size={12} />
          </ActionIcon>
        </Group>
      ))}

      <button
        type="button"
        onClick={handleAdd}
        title="Add color pair"
        className="flex items-center justify-center"
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          border: '2px dashed var(--mantine-color-dark-3)',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--mantine-color-dark-3)',
          transition: 'border-color 150ms ease, color 150ms ease',
        }}
      >
        <Plus size={14} />
      </button>

      <Tooltip
        label="No changes to save"
        disabled={isDirty}
        position="right"
        withArrow
      >
        <Button
          size="compact-xs"
          variant={isDirty ? 'filled' : 'default'}
          onClick={handleSave}
          loading={updatePalette.isPending}
          disabled={!isDirty}
          mt="xs"
          w="fit-content"
        >
          Save Palette
        </Button>
      </Tooltip>
    </div>
  );
}
