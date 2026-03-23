import { useMemo } from 'react';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import {
  isDirectColor,
  getNodeColor,
  getTextFillColor,
} from '../utils/node-color-helpers';

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
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, hex]) => ({
        value: id,
        label: EDITABLE_FIELDS[id].label,
        hex,
        fgHex: fgMap.get(id),
      }));
  }, [assignments, nodeMap]);
}
