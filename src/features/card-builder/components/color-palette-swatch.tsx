import { useCardEditorStore } from '../stores/card-editor-store';

import styles from './color-palette-swatch.module.css';

interface ColorPaletteSwatchProps {
  paletteId: number;
  colorPairs: { bg: string; fg: string }[];
  selected: boolean;
  label?: string;
}

export function ColorPaletteSwatch({
  paletteId,
  colorPairs,
  selected,
  label,
}: ColorPaletteSwatchProps) {
  const applyColorPreset = useCardEditorStore((s) => s.applyColorPreset);

  return (
    <button
      type="button"
      className={styles.wrapper}
      onClick={() => applyColorPreset(colorPairs, paletteId)}
      aria-label={`Apply ${label ?? 'palette'} colors`}
    >
      <div className={styles.swatch} data-selected={selected || undefined}>
        {colorPairs.map((pair, i) => (
          <div
            key={`${pair.bg}-${i}`}
            className={styles.band}
            style={{ backgroundColor: pair.bg }}
          />
        ))}
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </button>
  );
}
