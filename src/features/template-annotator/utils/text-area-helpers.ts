import type { EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { getElementBBoxInSvgRoot } from './get-element-bbox';
import { querySvgElement } from './svg-overlay-helpers';

/**
 * Measures the element's bbox and sets maxWidth/maxHeight unconditionally.
 */
export function resetTextDimensions(nodeId: string, fieldId: EditableFieldId) {
  const svgEl = querySvgElement();
  if (!svgEl) return;
  const bbox = getElementBBoxInSvgRoot(svgEl, nodeId);
  if (bbox) {
    useAnnotatorStore
      .getState()
      .setTextDimensions(
        nodeId,
        fieldId,
        Math.round(bbox.width),
        Math.round(bbox.height)
      );
  }
}

/**
 * If the assignment doesn't have maxWidth/maxHeight yet,
 * measures the element's bbox and initializes them.
 */
export function ensureTextDimensions(nodeId: string, fieldId: EditableFieldId) {
  const { assignments } = useAnnotatorStore.getState();
  const assignment = assignments.find(
    (a) => a.nodeId === nodeId && a.fieldId === fieldId
  );
  if (assignment?.maxWidth != null && assignment?.maxHeight != null) return;

  resetTextDimensions(nodeId, fieldId);
}
