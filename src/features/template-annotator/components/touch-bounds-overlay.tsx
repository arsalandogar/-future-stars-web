import { useEffect, useMemo, useCallback, useRef, useState } from 'react';

import type { EditableFieldId } from '@/features/templates';

import type { TouchBounds } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import {
  type HandleId,
  HANDLES,
  HANDLE_CURSORS,
  clampToViewBox,
  clientToSvgPoint,
  parseViewBox,
  applyResizeDelta,
  getCardBounds,
} from '../utils/svg-overlay-helpers';

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
  const setEditingTouchBounds = useAnnotatorStore(
    (s) => s.setEditingTouchBounds
  );

  // Preview bounds during drag — local state since only this component uses it
  const [preview, setPreview] = useState<TouchBounds | null>(null);

  const activeBounds = preview ?? bounds;

  const svgRef = useRef<SVGSVGElement>(null);

  const vb = useMemo<TouchBounds>(() => parseViewBox(viewBox), [viewBox]);
  const cardBounds = useMemo(() => getCardBounds(vb), [vb]);

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
          applyResizeDelta(dragging.handle, dragging.startBounds, dx, dy),
          cardBounds
        );
      }
      return clampToViewBox(
        {
          ...dragging.startBounds,
          x: dragging.startBounds.x + dx,
          y: dragging.startBounds.y + dy,
        },
        cardBounds
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
  }, [dragging, commitTouchBounds, nodeId, fieldId, cardBounds]);

  // Compute handle size as a fraction of viewBox (roughly 1.5% of the smaller dimension)
  const handleSize = Math.min(cardBounds.width, cardBounds.height) * 0.015;

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
        onPointerDown={(e) => {
          e.stopPropagation();
          setEditingTouchBounds(null);
        }}
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
        const cx = Math.max(
          cardBounds.x,
          Math.min(cardBounds.x + cardBounds.width, rawCx)
        );
        const cy = Math.max(
          cardBounds.y,
          Math.min(cardBounds.y + cardBounds.height, rawCy)
        );
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
