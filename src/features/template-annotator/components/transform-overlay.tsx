import { useEffect, useMemo, useCallback, useRef, useState } from 'react';

import type { TouchBounds } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { useElementBounds } from '../hooks/use-element-bounds';
import {
  collectSnapTargets,
  computeSnap,
  applySnap,
  type SnapTargets,
  type SnapResult,
} from '../utils/snap-alignment';
import {
  applyTranslate,
  applyScaleAroundPoint,
} from '../utils/svg-transform-helpers';
import {
  type HandleId,
  HANDLES,
  HANDLE_CURSORS,
  clampToViewBox,
  clientToSvgPoint,
  parseViewBox,
  applyResizeDelta,
  querySvgElement,
} from '../utils/svg-overlay-helpers';

function getAnchor(
  handle: HandleId,
  bounds: TouchBounds
): { ax: number; ay: number } {
  const { x, y, width, height } = bounds;
  switch (handle) {
    case 'nw':
      return { ax: x + width, ay: y + height };
    case 'n':
      return { ax: x + width / 2, ay: y + height };
    case 'ne':
      return { ax: x, ay: y + height };
    case 'e':
      return { ax: x, ay: y + height / 2 };
    case 'se':
      return { ax: x, ay: y };
    case 's':
      return { ax: x + width / 2, ay: y };
    case 'sw':
      return { ax: x + width, ay: y };
    case 'w':
      return { ax: x + width, ay: y + height / 2 };
  }
}

interface TransformOverlayProps {
  viewBox: string;
  nodeId: string;
}

export function TransformOverlay({ viewBox, nodeId }: TransformOverlayProps) {
  const commitNodeTransform = useAnnotatorStore((s) => s.commitNodeTransform);
  const setEditingTransform = useAnnotatorStore((s) => s.setEditingTransform);

  const baseBounds = useElementBounds(nodeId, true);
  const [preview, setPreview] = useState<TouchBounds | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  const vb = useMemo<TouchBounds>(() => parseViewBox(viewBox), [viewBox]);

  const activeBounds = preview ?? baseBounds;

  const [activeGuides, setActiveGuides] = useState<SnapResult | null>(null);

  const [dragging, setDragging] = useState<
    | {
        mode: 'resize';
        handle: HandleId;
        startBounds: TouchBounds;
        startPt: DOMPoint;
        ctmInverse: DOMMatrix;
        snapTargets: SnapTargets;
      }
    | {
        mode: 'move';
        startBounds: TouchBounds;
        startPt: DOMPoint;
        ctmInverse: DOMMatrix;
        snapTargets: SnapTargets;
      }
    | null
  >(null);

  const startDrag = useCallback(
    (e: React.PointerEvent, mode: 'move' | HandleId) => {
      e.stopPropagation();
      e.preventDefault();

      const svg = svgRef.current;
      if (!svg || !activeBounds) return;
      const result = clientToSvgPoint(svg, e.clientX, e.clientY);
      if (!result) return;

      const svgEl = querySvgElement();
      const { nodeIndex } = useAnnotatorStore.getState();
      const snapTargets = svgEl
        ? collectSnapTargets(svgEl, nodeIndex, nodeId, vb)
        : { x: [], y: [] };

      if (mode === 'move') {
        setDragging({
          mode: 'move',
          startBounds: { ...activeBounds },
          startPt: result.svgPt,
          ctmInverse: result.ctmInverse,
          snapTargets,
        });
      } else {
        setDragging({
          mode: 'resize',
          handle: mode,
          startBounds: { ...activeBounds },
          startPt: result.svgPt,
          ctmInverse: result.ctmInverse,
          snapTargets,
        });
      }
    },
    [activeBounds, nodeId, vb]
  );

  useEffect(() => {
    if (!dragging || !baseBounds) return;

    const snapThreshold = Math.min(vb.width, vb.height) * 0.008;
    const handle = dragging.mode === 'resize' ? dragging.handle : undefined;

    const computeRawBounds = (dx: number, dy: number): TouchBounds => {
      if (dragging.mode === 'resize') {
        return applyResizeDelta(dragging.handle, dragging.startBounds, dx, dy);
      }
      return {
        ...dragging.startBounds,
        x: dragging.startBounds.x + dx,
        y: dragging.startBounds.y + dy,
      };
    };

    const snapAndClamp = (
      dx: number,
      dy: number
    ): { bounds: TouchBounds; snap: SnapResult } => {
      const raw = computeRawBounds(dx, dy);
      const snap = computeSnap(
        raw,
        dragging.snapTargets,
        snapThreshold,
        dragging.mode,
        handle
      );
      const snapped = applySnap(raw, snap, dragging.mode, handle);
      return { bounds: clampToViewBox(snapped, vb), snap };
    };

    const toSvgPt = (clientX: number, clientY: number): DOMPoint => {
      return new DOMPoint(clientX, clientY).matrixTransform(
        dragging.ctmInverse
      );
    };

    const onMove = (e: PointerEvent) => {
      const svgPt = toSvgPt(e.clientX, e.clientY);
      const dx = svgPt.x - dragging.startPt.x;
      const dy = svgPt.y - dragging.startPt.y;
      const { bounds, snap } = snapAndClamp(dx, dy);
      setPreview(bounds);
      setActiveGuides(snap);
    };

    const onUp = (e: PointerEvent) => {
      const svgPt = toSvgPt(e.clientX, e.clientY);
      const dx = svgPt.x - dragging.startPt.x;
      const dy = svgPt.y - dragging.startPt.y;
      const { bounds: finalBounds } = snapAndClamp(dx, dy);

      const { nodeMap } = useAnnotatorStore.getState();
      const node = nodeMap.get(nodeId);
      const existingTransform =
        node?.type === 'element' ? node.attributes.transform : undefined;

      if (dragging.mode === 'move') {
        const tdx = finalBounds.x - baseBounds.x;
        const tdy = finalBounds.y - baseBounds.y;
        if (Math.abs(tdx) > 0.01 || Math.abs(tdy) > 0.01) {
          commitNodeTransform(
            nodeId,
            applyTranslate(existingTransform, tdx, tdy)
          );
        }
      } else {
        const sx = finalBounds.width / baseBounds.width;
        const sy = finalBounds.height / baseBounds.height;
        if (Math.abs(sx - 1) > 0.001 || Math.abs(sy - 1) > 0.001) {
          const { ax, ay } = getAnchor(dragging.handle, baseBounds);
          commitNodeTransform(
            nodeId,
            applyScaleAroundPoint(existingTransform, ax, ay, sx, sy)
          );
        }
      }

      setPreview(null);
      setDragging(null);
      setActiveGuides(null);
    };

    const onCancel = () => {
      setPreview(null);
      setDragging(null);
      setActiveGuides(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [dragging, commitNodeTransform, nodeId, baseBounds, vb]);

  const handleSize = Math.min(vb.width, vb.height) * 0.015;

  if (!activeBounds) return null;

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <rect
        x={vb.x}
        y={vb.y}
        width={vb.width}
        height={vb.height}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setEditingTransform(null);
        }}
      />

      <rect
        x={activeBounds.x}
        y={activeBounds.y}
        width={activeBounds.width}
        height={activeBounds.height}
        fill="rgba(255, 140, 0, 0.08)"
        stroke="rgb(255, 140, 0)"
        strokeWidth={handleSize / 4}
        strokeDasharray={`${handleSize} ${handleSize / 2}`}
        style={{
          pointerEvents: 'all',
          cursor: dragging?.mode === 'move' ? 'grabbing' : 'grab',
        }}
        onPointerDown={(e) => startDrag(e, 'move')}
      />

      {HANDLES.map((h) => {
        const rawCx = h.cx(activeBounds);
        const rawCy = h.cy(activeBounds);
        const cx = Math.max(vb.x, Math.min(vb.x + vb.width, rawCx));
        const cy = Math.max(vb.y, Math.min(vb.y + vb.height, rawCy));
        return (
          <rect
            key={h.id}
            x={cx - handleSize / 2}
            y={cy - handleSize / 2}
            width={handleSize}
            height={handleSize}
            fill="white"
            stroke="rgb(255, 140, 0)"
            strokeWidth={handleSize / 6}
            style={{
              cursor: HANDLE_CURSORS[h.id],
              pointerEvents: 'all',
            }}
            onPointerDown={(e) => startDrag(e, h.id)}
          />
        );
      })}

      {activeGuides?.x && (
        <line
          x1={activeGuides.x.guideValue}
          y1={vb.y}
          x2={activeGuides.x.guideValue}
          y2={vb.y + vb.height}
          stroke="rgba(255, 50, 50, 0.7)"
          strokeWidth={handleSize / 6}
          strokeDasharray={`${handleSize / 2} ${handleSize / 4}`}
          style={{ pointerEvents: 'none' }}
        />
      )}
      {activeGuides?.y && (
        <line
          x1={vb.x}
          y1={activeGuides.y.guideValue}
          x2={vb.x + vb.width}
          y2={activeGuides.y.guideValue}
          stroke="rgba(255, 50, 50, 0.7)"
          strokeWidth={handleSize / 6}
          strokeDasharray={`${handleSize / 2} ${handleSize / 4}`}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </svg>
  );
}
