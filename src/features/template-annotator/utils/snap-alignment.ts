import type { NodeMeta, TouchBounds } from '../types';
import { getElementBBoxInSvgRoot } from './get-element-bbox';
import type { HandleId } from './svg-overlay-helpers';

interface SnapTarget {
  value: number;
}

export interface SnapTargets {
  x: SnapTarget[];
  y: SnapTarget[];
}

export interface AxisSnap {
  delta: number;
  guideValue: number;
}

export interface SnapResult {
  x: AxisSnap | null;
  y: AxisSnap | null;
}

function isDescendant(
  nodeId: string,
  ancestorId: string,
  nodeIndex: Map<string, NodeMeta>
): boolean {
  let current = nodeIndex.get(nodeId);
  while (current?.parentNodeId) {
    if (current.parentNodeId === ancestorId) return true;
    current = nodeIndex.get(current.parentNodeId);
  }
  return false;
}

export function collectSnapTargets(
  svgEl: SVGSVGElement,
  nodeIndex: Map<string, NodeMeta>,
  draggedNodeId: string,
  vb: TouchBounds
): SnapTargets {
  const x: SnapTarget[] = [];
  const y: SnapTarget[] = [];

  // ViewBox edges + center
  x.push(
    { value: vb.x },
    { value: vb.x + vb.width / 2 },
    { value: vb.x + vb.width }
  );
  y.push(
    { value: vb.y },
    { value: vb.y + vb.height / 2 },
    { value: vb.y + vb.height }
  );

  for (const [id] of nodeIndex) {
    if (id === draggedNodeId || isDescendant(id, draggedNodeId, nodeIndex))
      continue;

    const bbox = getElementBBoxInSvgRoot(svgEl, id);
    if (!bbox || bbox.width === 0 || bbox.height === 0) continue;

    x.push(
      { value: bbox.x },
      { value: bbox.x + bbox.width / 2 },
      { value: bbox.x + bbox.width }
    );
    y.push(
      { value: bbox.y },
      { value: bbox.y + bbox.height / 2 },
      { value: bbox.y + bbox.height }
    );
  }

  return { x, y };
}

function findClosest(
  edges: number[],
  targets: SnapTarget[],
  threshold: number
): AxisSnap | null {
  let best: AxisSnap | null = null;
  let bestDist = threshold;

  for (const edge of edges) {
    for (const target of targets) {
      const dist = Math.abs(edge - target.value);
      if (dist < bestDist) {
        bestDist = dist;
        best = { delta: target.value - edge, guideValue: target.value };
      }
    }
  }

  return best;
}

export function computeSnap(
  bounds: TouchBounds,
  targets: SnapTargets,
  threshold: number,
  mode: 'move' | 'resize',
  handle?: HandleId
): SnapResult {
  let xEdges: number[];
  let yEdges: number[];

  if (mode === 'move') {
    xEdges = [bounds.x, bounds.x + bounds.width / 2, bounds.x + bounds.width];
    yEdges = [bounds.y, bounds.y + bounds.height / 2, bounds.y + bounds.height];
  } else {
    xEdges = [];
    yEdges = [];

    if (handle === 'nw' || handle === 'w' || handle === 'sw') {
      xEdges.push(bounds.x);
    }
    if (handle === 'ne' || handle === 'e' || handle === 'se') {
      xEdges.push(bounds.x + bounds.width);
    }
    if (handle === 'nw' || handle === 'n' || handle === 'ne') {
      yEdges.push(bounds.y);
    }
    if (handle === 'sw' || handle === 's' || handle === 'se') {
      yEdges.push(bounds.y + bounds.height);
    }
  }

  return {
    x: xEdges.length > 0 ? findClosest(xEdges, targets.x, threshold) : null,
    y: yEdges.length > 0 ? findClosest(yEdges, targets.y, threshold) : null,
  };
}

export function applySnap(
  bounds: TouchBounds,
  snap: SnapResult,
  mode: 'move' | 'resize',
  handle?: HandleId
): TouchBounds {
  let { x, y, width, height } = bounds;

  if (mode === 'move') {
    if (snap.x) x += snap.x.delta;
    if (snap.y) y += snap.y.delta;
  } else {
    // Resize: adjust the specific edge
    if (snap.x) {
      if (handle === 'nw' || handle === 'w' || handle === 'sw') {
        // Left edge snaps: shift x, adjust width
        x += snap.x.delta;
        width -= snap.x.delta;
      } else {
        // Right edge snaps: adjust width
        width += snap.x.delta;
      }
    }
    if (snap.y) {
      if (handle === 'nw' || handle === 'n' || handle === 'ne') {
        // Top edge snaps: shift y, adjust height
        y += snap.y.delta;
        height -= snap.y.delta;
      } else {
        // Bottom edge snaps: adjust height
        height += snap.y.delta;
      }
    }
  }

  return { x, y, width, height };
}
