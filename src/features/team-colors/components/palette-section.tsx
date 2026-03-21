import { useEffect, useState } from 'react';
import {
  ActionIcon,
  ColorPicker,
  ColorSwatch,
  Group,
  Popover,
  Text,
} from '@mantine/core';
import { ArrowLeftRight, Plus, RotateCcw } from 'lucide-react';

import {
  useUpdateColorPalette,
  type ColorPair,
} from '@/features/color-palettes';

interface PaletteSectionProps {
  colorPairs: ColorPair[];
  paletteId: number;
}

export function PaletteSection({ colorPairs, paletteId }: PaletteSectionProps) {
  const [localPairs, setLocalPairs] = useState<ColorPair[]>(colorPairs);
  const [editingIndex, setEditingIndex] = useState<{
    index: number;
    field: 'bg' | 'fg';
  } | null>(null);
  const updatePalette = useUpdateColorPalette();

  // Sync local state when the source palette changes (e.g. selecting a different team)
  useEffect(() => {
    setLocalPairs(colorPairs);
  }, [colorPairs]);

  const isDirty = JSON.stringify(localPairs) !== JSON.stringify(colorPairs);

  const handleColorChange = (
    index: number,
    field: 'bg' | 'fg',
    color: string
  ) => {
    setLocalPairs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: color } : p))
    );
  };

  const handleSwap = (index: number) => {
    setLocalPairs((prev) =>
      prev.map((p, i) => (i === index ? { ...p, bg: p.fg, fg: p.bg } : p))
    );
  };

  const handleReset = (index: number) => {
    setLocalPairs((prev) =>
      prev.map((p, i) => (i === index ? colorPairs[index] : p))
    );
  };

  const handleAdd = () => {
    setLocalPairs((prev) => [
      ...prev,
      { bg: '#5046FF', fg: '#FFFFFF', rank: prev.length },
    ]);
  };

  const handleSave = () => {
    updatePalette.mutate({ id: paletteId, colorPairs: localPairs });
  };

  return (
    <div className="flex flex-col gap-sm">
      <Group justify="space-between">
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Palette
        </Text>
        {isDirty && (
          <button
            type="button"
            className="text-xs font-semibold text-[var(--mantine-color-primary-4)] hover:underline"
            onClick={handleSave}
          >
            Save
          </button>
        )}
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
    </div>
  );
}
