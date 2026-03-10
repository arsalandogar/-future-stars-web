import type { EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { measureTextBounds } from './measure-text-bounds';

function measureAssignedTextDimensions(nodeId: string) {
  const { nodeMap, svgTree } = useAnnotatorStore.getState();
  if (!svgTree) return null;

  const textNode = nodeMap.get(nodeId);
  if (!textNode) return null;

  return measureTextBounds(textNode, svgTree);
}

/** Measures local text-space bounds and sets maxWidth/maxHeight unconditionally. */
export function resetTextDimensions(nodeId: string, fieldId: EditableFieldId) {
  const bounds = measureAssignedTextDimensions(nodeId);
  if (bounds) {
    useAnnotatorStore
      .getState()
      .setTextDimensions(
        nodeId,
        fieldId,
        Math.round(bounds.width),
        Math.round(bounds.height)
      );
  }
}

/** Initializes local text-space dimensions if the assignment does not have them. */
export function ensureTextDimensions(nodeId: string, fieldId: EditableFieldId) {
  const { assignments } = useAnnotatorStore.getState();
  const assignment = assignments.find(
    (a) => a.nodeId === nodeId && a.fieldId === fieldId
  );
  if (assignment?.maxWidth != null && assignment?.maxHeight != null) return;

  resetTextDimensions(nodeId, fieldId);
}
