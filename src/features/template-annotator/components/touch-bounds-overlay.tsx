import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { EditableFieldId } from '@/features/templates';

import type { TouchBounds } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';

type HandleId = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

function clampToViewBox(bounds: TouchBounds, vb: TouchBounds): TouchBounds {
  let { x, y, width, height } = bounds;
  width = Math.min(width, vb.width);
  height = Math.min(height, vb.height);
  x = Math.max(vb.x, Math.min(x, vb.x + vb.width - width));
  y = Math.max(vb.y, Math.min(y, vb.y + vb.height - height));
  return { x, y, width, height };
}

function clientToSvgPoint(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number
): { svgPt: DOMPoint; ctmInverse: DOMMatrix } | null {
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const ctmInverse = ctm.inverse();
  const svgPt = new DOMPoint(clientX, clientY).matrixTransform(ctmInverse);
  return { svgPt, ctmInverse };
}

const HANDLES: {
  id: HandleId;
  cx: (b: TouchBounds) => number;
  cy: (b: TouchBounds) => number;
}[] = [
  { id: 'nw', cx: (b) => b.x, cy: (b) => b.y },
  { id: 'n', cx: (b) => b.x + b.width / 2, cy: (b) => b.y },
  { id: 'ne', cx: (b) => b.x + b.width, cy: (b) => b.y },
  { id: 'e', cx: (b) => b.x + b.width, cy: (b) => b.y + b.height / 2 },
  { id: 'se', cx: (b) => b.x + b.width, cy: (b) => b.y + b.height },
  { id: 's', cx: (b) => b.x + b.width / 2, cy: (b) => b.y + b.height },
  { id: 'sw', cx: (b) => b.x, cy: (b) => b.y + b.height },
  { id: 'w', cx: (b) => b.x, cy: (b) => b.y + b.height / 2 },
];

const HANDLE_CURSORS: Record<HandleId, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

const MIN_SIZE = 10;

interface TouchBoundsOverlayProps {
  viewBox: string;
  bounds: TouchBounds;
  nodeId: string;
  fieldId: EditableFieldId;
}

export function TouchBoundsOverlay({
  viewBox,
  bounds,
  nodeId,
  fieldId,
}: TouchBoundsOverlayProps) {
  const commitTouchBounds = useAnnotatorStore((s) => s.commitTouchBounds);

  // Preview bounds during drag — local state since only this component uses it
  const [preview, setPreview] = useState<TouchBounds | null>(null);

  const activeBounds = preview ?? bounds;

  const svgRef = useRef<SVGSVGElement>(null);

  const vb = useMemo<TouchBounds>(() => {
    const parts = viewBox.split(/[\s,]+/).map(Number);
    return {
      x: parts[0] || 0,
      y: parts[1] || 0,
      width: parts[2] || 500,
      height: parts[3] || 500,
    };
  }, [viewBox]);

  const [dragging, setDragging] = useState<
    | {
        mode: 'resize';
        handle: HandleId;
        startBounds: TouchBounds;
        startPt: DOMPoint;
        ctmInverse: DOMMatrix;
      }
    | {
        mode: 'move';
        startBounds: TouchBounds;
        startPt: DOMPoint;
        ctmInverse: DOMMatrix;
      }
    | null
  >(null);

  const applyDelta = useCallback(
    (
      handle: HandleId,
      startBounds: TouchBounds,
      dx: number,
      dy: number
    ): TouchBounds => {
      let { x, y, width, height } = startBounds;

      // Horizontal
      if (handle === 'nw' || handle === 'w' || handle === 'sw') {
        const newX = x + dx;
        const newW = width - dx;
        if (newW >= MIN_SIZE) {
          x = newX;
          width = newW;
        }
      }
      if (handle === 'ne' || handle === 'e' || handle === 'se') {
        const newW = width + dx;
        if (newW >= MIN_SIZE) {
          width = newW;
        }
      }

      // Vertical
      if (handle === 'nw' || handle === 'n' || handle === 'ne') {
        const newY = y + dy;
        const newH = height - dy;
        if (newH >= MIN_SIZE) {
          y = newY;
          height = newH;
        }
      }
      if (handle === 'sw' || handle === 's' || handle === 'se') {
        const newH = height + dy;
        if (newH >= MIN_SIZE) {
          height = newH;
        }
      }

      return { x, y, width, height };
    },
    []
  );

  const startDrag = useCallback(
    (e: React.PointerEvent, mode: 'move' | HandleId) => {
      e.stopPropagation();
      e.preventDefault();

      const svg = svgRef.current;
      if (!svg) return;
      const result = clientToSvgPoint(svg, e.clientX, e.clientY);
      if (!result) return;

      if (mode === 'move') {
        setDragging({
          mode: 'move',
          startBounds: { ...activeBounds },
          startPt: result.svgPt,
          ctmInverse: result.ctmInverse,
        });
      } else {
        setDragging({
          mode: 'resize',
          handle: mode,
          startBounds: { ...activeBounds },
          startPt: result.svgPt,
          ctmInverse: result.ctmInverse,
        });
      }
    },
    [activeBounds]
  );

  useEffect(() => {
    if (!dragging) return;

    const computeBounds = (dx: number, dy: number): TouchBounds => {
      if (dragging.mode === 'resize') {
        return clampToViewBox(
          applyDelta(dragging.handle, dragging.startBounds, dx, dy),
          vb
        );
      }
      return clampToViewBox(
        {
          ...dragging.startBounds,
          x: dragging.startBounds.x + dx,
          y: dragging.startBounds.y + dy,
        },
        vb
      );
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
      setPreview(computeBounds(dx, dy));
    };

    const onUp = (e: PointerEvent) => {
      const svgPt = toSvgPt(e.clientX, e.clientY);
      const dx = svgPt.x - dragging.startPt.x;
      const dy = svgPt.y - dragging.startPt.y;
      commitTouchBounds(nodeId, fieldId, computeBounds(dx, dy));
      setPreview(null);
      setDragging(null);
    };

    const onCancel = () => {
      setPreview(null);
      setDragging(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [dragging, applyDelta, commitTouchBounds, nodeId, fieldId, vb]);

  // Compute handle size as a fraction of viewBox (roughly 1.5% of the smaller dimension)
  const handleSize = Math.min(vb.width, vb.height) * 0.015;

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
      {/* Full overlay background to capture clicks on empty area */}
      <rect
        x={vb.x}
        y={vb.y}
        width={vb.width}
        height={vb.height}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
      />

      {/* Bounds rectangle — draggable to move */}
      <rect
        x={activeBounds.x}
        y={activeBounds.y}
        width={activeBounds.width}
        height={activeBounds.height}
        fill="rgba(80, 70, 255, 0.08)"
        stroke="var(--mantine-color-primary-4)"
        strokeWidth={handleSize / 4}
        strokeDasharray={`${handleSize} ${handleSize / 2}`}
        style={{
          pointerEvents: 'all',
          cursor: dragging?.mode === 'move' ? 'grabbing' : 'grab',
        }}
        onPointerDown={(e) => startDrag(e, 'move')}
      />

      {/* Resize handles — clamped to viewBox so they remain visible/interactive */}
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
            stroke="var(--mantine-color-primary-4)"
            strokeWidth={handleSize / 6}
            style={{
              cursor: HANDLE_CURSORS[h.id],
              pointerEvents: 'all',
            }}
            onPointerDown={(e) => startDrag(e, h.id)}
          />
        );
      })}
    </svg>
  );
}
