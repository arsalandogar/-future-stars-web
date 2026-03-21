import { ColorSwatch } from '@mantine/core';

import type { ColorTeam } from '@/features/colors';

import styles from './palette-sidebar-item.module.css';

interface PaletteSidebarItemProps {
  team: ColorTeam;
  selected: boolean;
  colorType: 'colors' | 'text';
  onSelect: (paletteId: number) => void;
}

export function PaletteSidebarItem({
  team,
  selected,
  colorType,
  onSelect,
}: PaletteSidebarItemProps) {
  const colorPairs = team.palette?.colorPairs ?? [];

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={styles.item}
      data-selected={selected || undefined}
      onClick={() => onSelect(team.colorPaletteId)}
    >
      <div>
        <span className={styles.name}>{team.name}</span>
        {team.league && (
          <span className={styles.league}> ({team.league.label})</span>
        )}
      </div>
      <div className={styles.swatches}>
        {colorPairs.map((pair, i) => (
          <ColorSwatch
            key={i}
            color={colorType === 'colors' ? pair.bg : pair.fg}
            size={16}
          />
        ))}
      </div>
    </button>
  );
}
