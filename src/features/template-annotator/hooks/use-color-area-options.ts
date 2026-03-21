import { useMemo } from 'react';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { isDirectColor, getNodeColor } from '../utils/node-color-helpers';

export interface ColorAreaOption {
  value: EditableFieldId;
  label: string;
  hex: string | undefined;
}

export function useColorAreaOptions(): ColorAreaOption[] {
  const assignments = useAnnotatorStore((s) => s.assignments);
  const nodeMap = useAnnotatorStore((s) => s.nodeMap);

  return useMemo(() => {
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
    return Array.from(colorFieldMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, hex]) => ({
        value: id,
        label: EDITABLE_FIELDS[id].label,
        hex,
      }));
  }, [assignments, nodeMap]);
}
