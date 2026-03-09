import { useEffect, useMemo, useCallback, useRef, useState } from 'react';

import type { FieldAssignment, TouchBounds } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import { useElementBounds } from '../hooks/use-element-bounds';
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

const TEAL = 'rgb(0, 180, 160)';
const TEAL_FILL = 'rgba(0, 180, 160, 0.08)';

interface TextAreaOverlayProps {
  viewBox: string;
  assignment: FieldAssignment;
}

export function TextAreaOverlay({ viewBox, assignment }: TextAreaOverlayProps) {
  const { nodeId, fieldId, maxWidth, maxHeight } = assignment;
  const setTextDimensions = useAnnotatorStore((s) => s.setTextDimensions);
  const setEditingTextArea = useAnnotatorStore((s) => s.setEditingTextArea);

  // Get the element's real bbox for positioning
  const elementBounds = useElementBounds(nodeId, true);

  // Build the text area bounds: positioned at element bbox, sized to maxWidth × maxHeight
  const textAreaBounds = useMemo<TouchBounds | null>(() => {
    if (!elementBounds || maxWidth == null || maxHeight == null) return null;
    return {
      x: elementBounds.x,
      y: elementBounds.y,
      width: maxWidth,
      height: maxHeight,
    };
  }, [elementBounds, maxWidth, maxHeight]);

  const [preview, setPreview] = useState<TouchBounds | null>(null);
  const activeBounds = preview ?? textAreaBounds;

  const svgRef = useRef<SVGSVGElement>(null);
  const vb = useMemo<TouchBounds>(() => parseViewBox(viewBox), [viewBox]);
  const cardBounds = useMemo(() => getCardBounds(vb), [vb]);

  const [dragging, setDragging] = useState<{
    handle: HandleId;
    startBounds: TouchBounds;
    startPt: DOMPoint;
    ctmInverse: DOMMatrix;
  } | null>(null);

  const startDrag = useCallback(
    (e: React.PointerEvent, handle: HandleId) => {
      e.stopPropagation();
      e.preventDefault();

      const svg = svgRef.current;
      if (!svg || !activeBounds) return;
      const result = clientToSvgPoint(svg, e.clientX, e.clientY);
      if (!result) return;

      setDragging({
        handle,
        startBounds: { ...activeBounds },
        startPt: result.svgPt,
        ctmInverse: result.ctmInverse,
      });
    },
    [activeBounds]
  );

  useEffect(() => {
    if (!dragging) return;

    const toSvgPt = (clientX: number, clientY: number): DOMPoint => {
      return new DOMPoint(clientX, clientY).matrixTransform(
        dragging.ctmInverse
      );
    };

    const computeBounds = (dx: number, dy: number): TouchBounds => {
      return clampToViewBox(
        applyResizeDelta(dragging.handle, dragging.startBounds, dx, dy),
        cardBounds
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
      const finalBounds = computeBounds(dx, dy);
      setTextDimensions(
        nodeId,
        fieldId,
        Math.round(finalBounds.width),
        Math.round(finalBounds.height)
      );
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
  }, [dragging, setTextDimensions, nodeId, fieldId, cardBounds]);

  const handleSize = Math.min(cardBounds.width, cardBounds.height) * 0.015;

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
      {/* Background click to exit */}
      <rect
        x={vb.x}
        y={vb.y}
        width={vb.width}
        height={vb.height}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
        onPointerDown={(e) => {
          e.stopPropagation();
          setEditingTextArea(null);
        }}
      />

      {/* Text area rectangle — no move, resize only */}
      <rect
        x={activeBounds.x}
        y={activeBounds.y}
        width={activeBounds.width}
        height={activeBounds.height}
        fill={TEAL_FILL}
        stroke={TEAL}
        strokeWidth={handleSize / 4}
        strokeDasharray={`${handleSize} ${handleSize / 2}`}
        style={{ pointerEvents: 'all', cursor: 'default' }}
      />

      {/* Resize handles */}
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
            stroke={TEAL}
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
