import { useRef, type KeyboardEvent } from 'react';
import { Group, Loader, ScrollArea, Text } from '@mantine/core';

import type { ColorTeam } from '@/features/colors';

import { PaletteSidebarItem } from './palette-sidebar-item';

interface PaletteSidebarProps {
  teams: ColorTeam[];
  loading: boolean;
  selectedPaletteId: number | undefined;
  colorType: 'colors' | 'text';
  onSelect: (paletteId: number) => void;
}

export function PaletteSidebar({
  teams,
  loading,
  selectedPaletteId,
  colorType,
  onSelect,
}: PaletteSidebarProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollItemIntoView = (index: number) => {
    const viewport = viewportRef.current;
    const item =
      listRef.current?.querySelectorAll<HTMLElement>('[role="option"]')[index];
    if (!viewport || !item) return;

    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;
    const viewTop = viewport.scrollTop;
    const viewBottom = viewTop + viewport.clientHeight;

    if (itemBottom > viewBottom) {
      viewport.scrollTop = itemBottom - viewport.clientHeight;
    } else if (itemTop < viewTop) {
      viewport.scrollTop = itemTop;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (teams.length === 0) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    e.preventDefault();

    const currentIndex = teams.findIndex(
      (t) => t.colorPaletteId === selectedPaletteId
    );

    let nextIndex: number;
    if (e.key === 'ArrowDown') {
      nextIndex = currentIndex < teams.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : teams.length - 1;
    }

    onSelect(teams[nextIndex].colorPaletteId);
    scrollItemIntoView(nextIndex);
  };

  return (
    <div className="flex flex-col gap-xs" style={{ minHeight: 0 }}>
      <Group justify="space-between" style={{ flexShrink: 0 }}>
        <Text size="xs" fw={700} tt="uppercase" c="dimmed">
          Palette
        </Text>
        <button
          type="button"
          className="text-xs font-semibold uppercase tracking-wide text-[var(--mantine-color-primary-4)] hover:underline"
        >
          Add
        </button>
      </Group>
      <ScrollArea style={{ flex: 1, minHeight: 0 }} viewportRef={viewportRef}>
        {loading ? (
          <div className="flex items-center justify-center py-xl">
            <Loader size="sm" />
          </div>
        ) : teams.length === 0 ? (
          <Text c="dimmed" size="sm" ta="center" py="lg">
            No palettes found
          </Text>
        ) : (
          <div
            ref={listRef}
            role="listbox"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {teams.map((team) => (
              <PaletteSidebarItem
                key={team.id}
                team={team}
                selected={selectedPaletteId === team.colorPaletteId}
                colorType={colorType}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
