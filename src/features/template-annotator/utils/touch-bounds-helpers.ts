import type { EditableFieldId } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { getElementBBoxInSvgRoot } from './get-element-bbox';
import { querySvgElement } from './svg-overlay-helpers';

/**
 * If the node has no touch bounds yet, initializes them from the element's bbox.
 */
export function ensureTouchBounds(nodeId: string, fieldId: EditableFieldId) {
  const { assignments, commitTouchBounds } = useAnnotatorStore.getState();
  const assignment = assignments.find(
    (a) => a.nodeId === nodeId && a.fieldId === fieldId
  );
  if (assignment?.touchBounds) return;

  const svgEl = querySvgElement();
  if (!svgEl) return;
  const bbox = getElementBBoxInSvgRoot(svgEl, nodeId);
  if (bbox) commitTouchBounds(nodeId, fieldId, bbox);
}
