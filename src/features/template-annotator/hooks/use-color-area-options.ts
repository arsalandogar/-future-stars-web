import { useMemo } from 'react';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import {
  isDirectColor,
  getNodeColor,
  getTextFillColor,
} from '../utils/node-color-helpers';

/** Vocabulary-definition order for color fields (colorOne=0, colorTwo=1, …). */
const COLOR_FIELD_ORDER = new Map(
  Object.entries(EDITABLE_FIELDS)
    .filter(([, f]) => f.type === 'color')
    .map(([id], i) => [id as EditableFieldId, i])
);

export interface ColorAreaOption {
  value: EditableFieldId;
  label: string;
  /** Background color extracted from the SVG (fill/stroke/stop-color). */
  hex: string | undefined;
  /** Foreground color extracted from a text element linked via textColorArea. */
  fgHex: string | undefined;
}

export function useColorAreaOptions(): ColorAreaOption[] {
  const assignments = useAnnotatorStore((s) => s.assignments);
  const nodeMap = useAnnotatorStore((s) => s.nodeMap);
  const defaultPaletteFg = useAnnotatorStore((s) => s.defaultPaletteFg);
  const defaultPaletteBg = useAnnotatorStore((s) => s.defaultPaletteBg);

  return useMemo(() => {
    // Collect BG color per color field
    const colorFieldMap = new Map<EditableFieldId, string | undefined>();
    for (const a of assignments) {
      if (EDITABLE_FIELDS[a.fieldId].type !== 'color') continue;
      if (isDirectColor(colorFieldMap.get(a.fieldId))) continue;
      const node = nodeMap.get(a.nodeId);
      const hex = node ? getNodeColor(node, a.colorTarget) : undefined;
      if (
        !colorFieldMap.has(a.fieldId) ||
        (hex && !colorFieldMap.get(a.fieldId))
      ) {
        colorFieldMap.set(a.fieldId, hex);
      }
    }

    // Collect FG color from text elements linked via textColorArea
    const fgMap = new Map<EditableFieldId, string | undefined>();
    for (const a of assignments) {
      if (!a.textColorArea || fgMap.has(a.textColorArea)) continue;
      const node = nodeMap.get(a.nodeId);
      if (node) {
        fgMap.set(a.textColorArea, getTextFillColor(node));
      }
    }

    return Array.from(colorFieldMap)
      .sort(
        ([a], [b]) =>
          (COLOR_FIELD_ORDER.get(a) ?? 0) - (COLOR_FIELD_ORDER.get(b) ?? 0)
      )
      .map(([id, hex]) => ({
        value: id,
        label: EDITABLE_FIELDS[id].label,
        // Use default palette bg override first, then SVG-derived color
        hex: defaultPaletteBg.get(id) ?? hex,
        // Use text-linked fg first, then default palette fg as fallback
        fgHex: fgMap.get(id) ?? defaultPaletteFg.get(id),
      }));
  }, [assignments, nodeMap, defaultPaletteFg, defaultPaletteBg]);
}
