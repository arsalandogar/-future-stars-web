import type { SvgJsonNode } from '@/types/svg';
import { EDITABLE_FIELDS } from '@/features/templates';

import type { FieldAssignment } from '../types';

function stripNodeIds(node: SvgJsonNode): SvgJsonNode {
  if (node.type === 'text') return node;

  const attrs = { ...node.attributes };
  delete attrs['__nodeId'];
  return {
    ...node,
    attributes: attrs,
    children: node.children.map(stripNodeIds),
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

          const attrKey =
            field.type === 'color'
              ? 'data-color-field'
              : field.type === 'image'
                ? 'data-image-field'
                : 'data-text-field';
          node.attributes[attrKey] = assignment.fieldId;

          if (field.type === 'color' && assignment.colorTarget) {
            node.attributes['data-color-target'] = assignment.colorTarget;
          }

          if (field.type === 'text' && assignment.maxWidth != null) {
            node.attributes['data-max-width'] = String(assignment.maxWidth);
          }
        }
      }
    }

    for (const child of node.children) {
      injectAttributes(child);
    }
  }

  injectAttributes(clone);
  return stripNodeIds(clone);
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
