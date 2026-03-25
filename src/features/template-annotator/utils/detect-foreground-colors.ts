import type { SvgJsonNode } from '@/types/svg';
import type { EditableFieldId } from '@/features/templates';

import type { TouchBounds } from '../types';
import { contrastColor } from './contrast-color';
import { getElementBBoxInSvgRoot } from './get-element-bbox';
import { getTextFillColor } from './node-color-helpers';

export interface FgDetectionResult {
  /** Detected fg color per area (most common text fill, or contrast fallback). */
  fgColors: Map<EditableFieldId, string>;
  /** Text nodeIds overlapping each color area. */
  textAreaLinks: Map<EditableFieldId, string[]>;
}

function boundsArea(b: TouchBounds): number {
  return b.width * b.height;
}

function containsPoint(bounds: TouchBounds, px: number, py: number): boolean {
  return (
    px >= bounds.x &&
    px <= bounds.x + bounds.width &&
    py >= bounds.y &&
    py <= bounds.y + bounds.height
  );
}

/**
 * Detect foreground colors for each color area by spatial overlap with text elements.
 *
 * Uses per-element bounding boxes (not union) to find which individual color element
 * each text sits on. The smallest containing element wins, so a specific bar/band beats
 * a full-card background.
 */
export function detectForegroundColors(
  svgEl: SVGSVGElement,
  colorAreaMembers: Map<EditableFieldId, string[]>,
  textNodeIds: string[],
  nodeMap: Map<string, SvgJsonNode>,
  bgHexMap: Map<EditableFieldId, string>
): FgDetectionResult {
  // 1. Compute per-element bounding boxes, tagged with their color area
  const memberElements: {
    fieldId: EditableFieldId;
    bbox: TouchBounds;
    area: number;
  }[] = [];

  for (const [fieldId, memberNodeIds] of colorAreaMembers) {
    for (const nodeId of memberNodeIds) {
      const bbox = getElementBBoxInSvgRoot(svgEl, nodeId);
      if (bbox && bbox.width > 0 && bbox.height > 0) {
        memberElements.push({ fieldId, bbox, area: boundsArea(bbox) });
      }
    }
  }

  // 2. Classify each text element to the smallest containing member element
  const textAreaLinks = new Map<EditableFieldId, string[]>();
  for (const fieldId of colorAreaMembers.keys()) {
    textAreaLinks.set(fieldId, []);
  }

  for (const textNodeId of textNodeIds) {
    const textBbox = getElementBBoxInSvgRoot(svgEl, textNodeId);
    if (!textBbox) continue;

    const cx = textBbox.x + textBbox.width / 2;
    const cy = textBbox.y + textBbox.height / 2;

    let bestFieldId: EditableFieldId | null = null;
    let bestArea = Infinity;

    for (const member of memberElements) {
      if (containsPoint(member.bbox, cx, cy) && member.area < bestArea) {
        bestArea = member.area;
        bestFieldId = member.fieldId;
      }
    }

    if (bestFieldId) {
      textAreaLinks.get(bestFieldId)!.push(textNodeId);
    }
  }

  // 3. Compute fg color per area: most common text fill, or contrast fallback
  const fgColors = new Map<EditableFieldId, string>();

  for (const [fieldId] of colorAreaMembers) {
    const linkedTextIds = textAreaLinks.get(fieldId) ?? [];
    const bgHex = bgHexMap.get(fieldId) ?? '#888888';

    if (linkedTextIds.length === 0) {
      fgColors.set(fieldId, contrastColor(bgHex));
      continue;
    }

    // Count fill colors
    const fillCounts = new Map<string, number>();
    for (const nodeId of linkedTextIds) {
      const node = nodeMap.get(nodeId);
      if (!node) continue;
      const fill = getTextFillColor(node).toLowerCase();
      fillCounts.set(fill, (fillCounts.get(fill) ?? 0) + 1);
    }

    // Pick the most common fill
    let bestFill: string = contrastColor(bgHex);
    let bestCount = 0;
    for (const [fill, count] of fillCounts) {
      if (count > bestCount) {
        bestCount = count;
        bestFill = fill;
      }
    }
    fgColors.set(fieldId, bestFill);
  }

  return { fgColors, textAreaLinks };
}
