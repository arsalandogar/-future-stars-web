import type { SvgJsonNode, ColorTarget } from '@/types/svg';
import { parseOffset } from '@/utils/color-math';
import { parseTouchBounds } from '@fs-card-engine';

import { EDITABLE_FIELDS, type EditableFieldId } from '@/features/templates';

import { supportsTouchBounds } from './svg-node-helpers';

import type { FieldAssignment, TextAlign } from '../types';
import {
  DATA_ATTR_BY_TYPE,
  DATA_ATTR_COLOR_TARGET,
  DATA_ATTR_COLOR_OFFSET,
  DATA_ATTR_MAX_WIDTH,
  DATA_ATTR_MAX_HEIGHT,
  DATA_ATTR_TOUCH_BOUNDS,
  DATA_ATTR_TEXT_ALIGN,
} from './export-annotated-svg';

function isEditableFieldId(value: string): value is EditableFieldId {
  return value in EDITABLE_FIELDS;
}

/**
 * Extracts FieldAssignment[] from data-* attributes injected by buildAnnotatedSvg.
 * Iterates the pre-built nodeMap to avoid a redundant tree traversal.
 */
export function extractAssignments(
  nodeMap: Map<string, SvgJsonNode>
): FieldAssignment[] {
  const assignments: FieldAssignment[] = [];

  for (const [nodeId, node] of nodeMap) {
    for (const attr of Object.values(DATA_ATTR_BY_TYPE)) {
      const fieldId = node.attributes[attr];
      if (!fieldId || !isEditableFieldId(fieldId)) continue;

      const field = EDITABLE_FIELDS[fieldId];
      const assignment: FieldAssignment = { nodeId, fieldId };

      if (field.type === 'color') {
        const target = node.attributes[DATA_ATTR_COLOR_TARGET] as
          | ColorTarget
          | undefined;
        if (target) assignment.colorTarget = target;

        const offsetStr = node.attributes[DATA_ATTR_COLOR_OFFSET];
        if (offsetStr) {
          const offset = parseOffset(offsetStr);
          if (offset) assignment.colorOffset = offset;
        }
      }

      if (field.type === 'text') {
        const maxWidthStr = node.attributes[DATA_ATTR_MAX_WIDTH];
        if (maxWidthStr) {
          const maxWidth = Number(maxWidthStr);
          if (Number.isFinite(maxWidth)) assignment.maxWidth = maxWidth;
        }

        const maxHeightStr = node.attributes[DATA_ATTR_MAX_HEIGHT];
        if (maxHeightStr) {
          const maxHeight = Number(maxHeightStr);
          if (Number.isFinite(maxHeight)) assignment.maxHeight = maxHeight;
        }

        const textAlignStr = node.attributes[DATA_ATTR_TEXT_ALIGN];
        if (
          textAlignStr === 'left' ||
          textAlignStr === 'center' ||
          textAlignStr === 'right'
        ) {
          assignment.textAlign = textAlignStr as TextAlign;
        }
      }

      if (supportsTouchBounds(field.type)) {
        const touchBounds = parseTouchBounds(
          node.attributes[DATA_ATTR_TOUCH_BOUNDS]
        );
        if (touchBounds) assignment.touchBounds = touchBounds;
      }

      assignments.push(assignment);
    }
  }

  return assignments;
}
