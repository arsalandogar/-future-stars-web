import { useMemo } from 'react';

import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import { useTemplateColorPalettes } from '../api/template-color-palettes';
import { readNodeFill } from '../utils/read-node-fill';

/** Return contrasting text color based on relative luminance of a hex bg. */
function contrastFg(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length < 6) return '#ffffff';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.5 ? '#000000' : '#ffffff';
}

function colorsMatch(
  a: { bg: string; fg: string }[],
  b: { bg: string; fg: string }[]
): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (pair, i) =>
      pair.bg.toLowerCase() === b[i].bg.toLowerCase() &&
      pair.fg.toLowerCase() === b[i].fg.toLowerCase()
  );
}

/**
 * Serialize current color pairs to a stable string so the Zustand selector
 * returns a primitive that won't trigger infinite re-renders.
 */
function serializeColorPairs(side: {
  editableColorFields: { fieldId: string; originalValue: string }[];
  editableFields: {
    textColorArea?: string;
    elementNodes: { attributes: Record<string, string> }[];
    originalTextColor?: string;
  }[];
  edits: Record<string, unknown>;
  appliedPresetColors: { bg: string; fg: string }[] | null;
}): string {
  return side.editableColorFields
    .map((field, i) => {
      const bg =
        typeof side.edits[field.fieldId] === 'string'
          ? (side.edits[field.fieldId] as string)
          : field.originalValue;

      let fg = '';
      for (const tf of side.editableFields) {
        if (tf.textColorArea !== field.fieldId) continue;
        const node = tf.elementNodes[0];
        if (node) fg = readNodeFill(node) ?? '';
        break;
      }
      if (
        !fg &&
        side.appliedPresetColors &&
        i < side.appliedPresetColors.length
      ) {
        fg = side.appliedPresetColors[i].fg;
      }
      if (!fg) {
        for (const tf of side.editableFields) {
          if (tf.textColorArea !== field.fieldId) continue;
          fg = tf.originalTextColor ?? '';
          break;
        }
      }

      // Ensure fg is never empty — pick white or black based on bg luminance
      if (!fg) fg = contrastFg(bg);

      return `${bg}|${fg}`;
    })
    .join(',');
}

function parseColorPairs(serialized: string): { bg: string; fg: string }[] {
  if (!serialized) return [];
  return serialized.split(',').map((entry) => {
    const [bg, fg] = entry.split('|');
    return { bg, fg };
  });
}

export function useIsTemplatePalette() {
  const templateDefaultsId = useCardBuilderStore((s) => s.templateDefaultsId);
  const appliedPresetId = useCardEditorStore(
    (s) => s.sides[s.activeSide].appliedPresetId
  );

  const { data: templatePalettes } = useTemplateColorPalettes({
    variables: templateDefaultsId ?? 0,
    enabled: templateDefaultsId != null,
  });

  // Stable string — only changes when actual color values change
  const colorPairsKey = useCardEditorStore((s) =>
    serializeColorPairs(s.sides[s.activeSide])
  );

  const currentColorPairs = useMemo(
    () => parseColorPairs(colorPairsKey),
    [colorPairsKey]
  );

  // Find matching popular palette — by ID first, then by color values
  const popularPalettes = templatePalettes?.data ?? [];
  let matchingPaletteId: number | null = null;

  if (appliedPresetId != null) {
    const found = popularPalettes.find((p) => p.id === appliedPresetId);
    if (found) matchingPaletteId = found.id;
  }

  if (matchingPaletteId == null && currentColorPairs.length > 0) {
    for (const palette of popularPalettes) {
      const pairs = palette.colorPairs.map((c) => ({ bg: c.bg, fg: c.fg }));
      if (colorsMatch(currentColorPairs, pairs)) {
        matchingPaletteId = palette.id;
        break;
      }
    }
  }

  return {
    templateDefaultsId,
    appliedPresetId,
    isPopular: matchingPaletteId != null,
    matchingPaletteId,
    currentColorPairs,
  };
}
