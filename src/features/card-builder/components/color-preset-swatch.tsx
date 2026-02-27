import type { ColorPreset } from '@/features/colors';

import { useCardEditorStore } from '../stores/card-editor-store';

import styles from './color-preset-swatch.module.css';

interface ColorPresetSwatchProps {
  preset: ColorPreset;
  selected: boolean;
  showLabel?: boolean;
}

export function ColorPresetSwatch({
  preset,
  selected,
  showLabel,
}: ColorPresetSwatchProps) {
  const applyColorPreset = useCardEditorStore((s) => s.applyColorPreset);

  return (
    <button
      type="button"
      className={styles.wrapper}
      onClick={() => applyColorPreset(preset.colors, preset.id)}
      aria-label={`Apply ${preset.name} colors`}
    >
      <div className={styles.swatch} data-selected={selected || undefined}>
        {preset.colors.map((color) => (
          <div
            key={color}
            className={styles.band}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      {showLabel && <span className={styles.label}>{preset.abbreviation}</span>}
    </button>
  );
}
