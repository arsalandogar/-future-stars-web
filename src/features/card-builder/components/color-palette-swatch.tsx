import { useCardEditorStore } from '../stores/card-editor-store';

import styles from './color-palette-swatch.module.css';

interface ColorPaletteSwatchProps {
  paletteId: number;
  colors: string[];
  selected: boolean;
  label?: string;
}

export function ColorPaletteSwatch({
  paletteId,
  colors,
  selected,
  label,
}: ColorPaletteSwatchProps) {
  const applyColorPreset = useCardEditorStore((s) => s.applyColorPreset);

  return (
    <button
      type="button"
      className={styles.wrapper}
      onClick={() => applyColorPreset(colors, paletteId)}
      aria-label={`Apply ${label ?? 'palette'} colors`}
    >
      <div className={styles.swatch} data-selected={selected || undefined}>
        {colors.map((color, i) => (
          <div
            key={`${color}-${i}`}
            className={styles.band}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </button>
  );
}
