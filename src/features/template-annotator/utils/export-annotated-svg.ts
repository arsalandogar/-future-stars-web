import type { SvgJsonNode } from '@/types/svg';
import { EDITABLE_FIELDS } from '@/features/templates';
import { isZeroOffset, serializeOffset } from '@/utils/color-math';

import type { FieldAssignment } from '../types';
import { supportsTouchBounds } from './svg-node-helpers';

export const DATA_ATTR_BY_TYPE: Record<string, string> = {
  color: 'data-color-field',
  image: 'data-image-field',
  text: 'data-text-field',
};

export const DATA_ATTR_COLOR_TARGET = 'data-color-target';
export const DATA_ATTR_COLOR_OFFSET = 'data-color-offset';
export const DATA_ATTR_MAX_WIDTH = 'data-max-width';
export const DATA_ATTR_MAX_HEIGHT = 'data-max-height';
export const DATA_ATTR_TEXT_MULTILINE = 'data-text-multiline';
export const DATA_ATTR_TOUCH_BOUNDS = 'data-touch-bounds';
export const DATA_ATTR_TEXT_ALIGN = 'data-text-align';

export const ALL_ANNOTATION_ATTRS = [
  ...Object.values(DATA_ATTR_BY_TYPE),
  DATA_ATTR_COLOR_TARGET,
  DATA_ATTR_COLOR_OFFSET,
  DATA_ATTR_MAX_WIDTH,
  DATA_ATTR_MAX_HEIGHT,
  DATA_ATTR_TEXT_MULTILINE,
  DATA_ATTR_TOUCH_BOUNDS,
  DATA_ATTR_TEXT_ALIGN,
];

function stripInternalAttrs(node: SvgJsonNode): SvgJsonNode {
  if (node.type === 'text') return node;

  const attrs = { ...node.attributes };
  for (const key of Object.keys(attrs)) {
    if (key.startsWith('__')) delete attrs[key];
  }
  return {
    ...node,
    attributes: attrs,
    children: node.children.map(stripInternalAttrs),
  };
}

export function buildAnnotatedSvg(
  svgTree: SvgJsonNode,
  assignments: FieldAssignment[]
): SvgJsonNode {
  const clone = structuredClone(svgTree);

  // Build a lookup: nodeId → assignments
  const assignmentsByNode = new Map<string, FieldAssignment[]>();
  for (const assignment of assignments) {
    const existing = assignmentsByNode.get(assignment.nodeId) ?? [];
    existing.push(assignment);
    assignmentsByNode.set(assignment.nodeId, existing);
  }

  // Walk the tree and inject data-* attributes
  function injectAttributes(node: SvgJsonNode): void {
    if (node.type === 'text') return;

    const nodeId = node.attributes['__nodeId'];
    if (nodeId) {
      const nodeAssignments = assignmentsByNode.get(nodeId);
      if (nodeAssignments) {
        for (const assignment of nodeAssignments) {
          const field = EDITABLE_FIELDS[assignment.fieldId];

          node.attributes[DATA_ATTR_BY_TYPE[field.type]] = assignment.fieldId;

          if (field.type === 'color' && assignment.colorTarget) {
            node.attributes[DATA_ATTR_COLOR_TARGET] = assignment.colorTarget;
          }

          if (
            field.type === 'color' &&
            assignment.colorOffset &&
            !isZeroOffset(assignment.colorOffset)
          ) {
            node.attributes[DATA_ATTR_COLOR_OFFSET] = serializeOffset(
              assignment.colorOffset
            );
          }

          if (field.type === 'text' && assignment.maxWidth != null) {
            node.attributes[DATA_ATTR_MAX_WIDTH] = String(assignment.maxWidth);
          }

          if (field.type === 'text' && assignment.maxHeight != null) {
            node.attributes[DATA_ATTR_MAX_HEIGHT] = String(
              assignment.maxHeight
            );
          }

          if (field.type === 'text' && assignment.multiline) {
            node.attributes[DATA_ATTR_TEXT_MULTILINE] = 'true';
          }

          if (field.type === 'text' && assignment.textAlign) {
            node.attributes[DATA_ATTR_TEXT_ALIGN] = assignment.textAlign;
          }

          if (supportsTouchBounds(field.type) && assignment.touchBounds) {
            const b = assignment.touchBounds;
            node.attributes[DATA_ATTR_TOUCH_BOUNDS] =
              `${b.x},${b.y},${b.width},${b.height}`;
          }
        }
      }
    }

    for (const child of node.children) {
      injectAttributes(child);
    }
  }

  injectAttributes(clone);
  return stripInternalAttrs(clone);
}

export function stripAnnotationAttrs(node: SvgJsonNode): void {
  if (node.type === 'text') return;

  for (const attr of ALL_ANNOTATION_ATTRS) {
    delete node.attributes[attr];
  }

  for (const child of node.children) {
    stripAnnotationAttrs(child);
  }
}

export function exportToJson(
  svgTree: SvgJsonNode,
  assignments: FieldAssignment[]
): string {
  const annotated = buildAnnotatedSvg(svgTree, assignments);
  return JSON.stringify(annotated, null, 2);
}

export function downloadJson(json: string, fileName: string): void {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.replace(/\.svg$/i, '') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}
