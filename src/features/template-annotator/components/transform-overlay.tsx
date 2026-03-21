import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { FieldAssignment, TouchBounds } from '../types';
import { useAnnotatorStore } from '../stores/annotator-store';
import {
  useElementBounds,
  useElementGeometry,
} from '../hooks/use-element-bounds';
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
  applyMatrixPrepend,
  conjugateTransform,
  transformVector,
  getBoundsFromPoints,
  getTransformedRectPoints,
  transformPoint,
  type SvgPoint,
} from '../utils/svg-transform-helpers';
import { computeSvgToParent } from '../utils/get-element-bbox';
import {
  type HandleId,
  HANDLES,
  clampToViewBox,
  clientToSvgPoint,
  parseViewBox,
  applyResizeDelta,
  querySvgElement,
  getCardBounds,
  getHandleCursor,
  getComputedTextAnchor,
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

function getEffectiveTextAnchor(
  assignment: FieldAssignment | null | undefined,
  nodeId: string
): 'start' | 'middle' | 'end' {
  if (!assignment) return 'start';
  return getComputedTextAnchor(nodeId);
}

function buildTextLocalRect(
  glyphBounds: TouchBounds,
  maxWidth: number,
  maxHeight: number,
  anchor: 'start' | 'middle' | 'end'
): TouchBounds {
  let x = glyphBounds.x;
  if (anchor === 'middle') {
    const anchorX = glyphBounds.x + glyphBounds.width / 2;
    x = anchorX - maxWidth / 2;
  } else if (anchor === 'end') {
    const anchorX = glyphBounds.x + glyphBounds.width;
    x = anchorX - maxWidth;
  }

  return {
    x,
    y: glyphBounds.y,
    width: maxWidth,
    height: maxHeight,
  };
}

function getRotatedHandlePoints(
  points: SvgPoint[]
): Record<HandleId, SvgPoint> {
  const [nw, ne, se, sw] = points;
  return {
    nw,
    n: midpoint(nw, ne),
    ne,
    e: midpoint(ne, se),
    se,
    s: midpoint(se, sw),
    sw,
    w: midpoint(sw, nw),
  };
}

function midpoint(a: SvgPoint, b: SvgPoint): SvgPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function toPolygonPoints(points: SvgPoint[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function shiftLocalRectInSvgSpace(
  rect: TouchBounds,
  localToSvg: DOMMatrix,
  svgToLocal: DOMMatrix,
  dx: number,
  dy: number
): TouchBounds {
  if (dx === 0 && dy === 0) return rect;

  const origin = transformPoint(localToSvg, rect.x, rect.y);
  const shiftedOrigin = transformPoint(
    svgToLocal,
    origin.x + dx,
    origin.y + dy
  );
  return { ...rect, x: shiftedOrigin.x, y: shiftedOrigin.y };
}

function getClampDelta(
  bounds: TouchBounds,
  vb: TouchBounds
): { dx: number; dy: number } {
  let dx = 0;
  let dy = 0;

  if (bounds.x < vb.x) {
    dx = vb.x - bounds.x;
  } else if (bounds.x + bounds.width > vb.x + vb.width) {
    dx = vb.x + vb.width - (bounds.x + bounds.width);
  }

  if (bounds.y < vb.y) {
    dy = vb.y - bounds.y;
  } else if (bounds.y + bounds.height > vb.y + vb.height) {
    dy = vb.y + vb.height - (bounds.y + bounds.height);
  }

  return { dx, dy };
}

interface TextOverlayGeometry {
  localRect: TouchBounds;
  points: SvgPoint[];
  bounds: TouchBounds;
  localToSvg: DOMMatrix;
  svgToLocal: DOMMatrix;
  rotation: number;
}

function buildTextOverlayGeometry(
  localRect: TouchBounds,
  localToSvg: DOMMatrix,
  svgToLocal: DOMMatrix,
  rotation: number
): TextOverlayGeometry {
  const points = getTransformedRectPoints(localRect, localToSvg);
  return {
    localRect,
    points,
    bounds: getBoundsFromPoints(points),
    localToSvg,
    svgToLocal,
    rotation,
  };
}

type DraggingState =
  | {
      kind: 'axis';
      mode: 'resize';
      handle: HandleId;
      startBounds: TouchBounds;
      startPt: DOMPoint;
      ctmInverse: DOMMatrix;
      snapTargets: SnapTargets;
      svgToParent: DOMMatrix;
    }
  | {
      kind: 'axis';
      mode: 'move';
      startBounds: TouchBounds;
      startPt: DOMPoint;
      ctmInverse: DOMMatrix;
      snapTargets: SnapTargets;
      svgToParent: DOMMatrix;
    }
  | {
      kind: 'text';
      mode: 'resize';
      handle: HandleId;
      startLocalRect: TouchBounds;
      startLocalPt: DOMPoint;
      startBounds: TouchBounds;
      localToSvg: DOMMatrix;
      svgToLocal: DOMMatrix;
      svgToParent: DOMMatrix;
    }
  | {
      kind: 'text';
      mode: 'move';
      startLocalRect: TouchBounds;
      startLocalPt: DOMPoint;
      startBounds: TouchBounds;
      localToSvg: DOMMatrix;
      svgToLocal: DOMMatrix;
      snapTargets: SnapTargets;
      svgToParent: DOMMatrix;
    };

interface TransformOverlayProps {
  viewBox: string;
  nodeId: string;
  assignment?: FieldAssignment | null;
  /** Hide the full-viewport click-away background (used in bulk mode). */
  hideBackground?: boolean;
}

export function TransformOverlay({
  viewBox,
  nodeId,
  assignment,
  hideBackground,
}: TransformOverlayProps) {
  const commitNodeTransform = useAnnotatorStore((s) => s.commitNodeTransform);
  const commitTextAreaResize = useAnnotatorStore((s) => s.commitTextAreaResize);
  const setEditingTransform = useAnnotatorStore((s) => s.setEditingTransform);

  const elementBounds = useElementBounds(nodeId, true);
  const elementGeometry = useElementGeometry(nodeId, !!assignment);

  const textBaseGeometry = useMemo<TextOverlayGeometry | null>(() => {
    if (
      !assignment ||
      assignment.maxWidth == null ||
      assignment.maxHeight == null ||
      !elementGeometry
    ) {
      return null;
    }

    const anchor = getEffectiveTextAnchor(assignment, nodeId);
    const localRect = buildTextLocalRect(
      elementGeometry.localBounds,
      assignment.maxWidth,
      assignment.maxHeight,
      anchor
    );

    return buildTextOverlayGeometry(
      localRect,
      elementGeometry.localToSvg,
      elementGeometry.svgToLocal,
      elementGeometry.rotation
    );
  }, [assignment, elementGeometry, nodeId]);

  const [previewBounds, setPreviewBounds] = useState<TouchBounds | null>(null);
  const [previewLocalRect, setPreviewLocalRect] = useState<TouchBounds | null>(
    null
  );

  const activeTextGeometry = useMemo<TextOverlayGeometry | null>(() => {
    if (!textBaseGeometry) return null;
    if (!previewLocalRect) return textBaseGeometry;
    return buildTextOverlayGeometry(
      previewLocalRect,
      textBaseGeometry.localToSvg,
      textBaseGeometry.svgToLocal,
      textBaseGeometry.rotation
    );
  }, [previewLocalRect, textBaseGeometry]);

  const svgRef = useRef<SVGSVGElement>(null);

  const vb = useMemo<TouchBounds>(() => parseViewBox(viewBox), [viewBox]);
  const cardBounds = useMemo(() => getCardBounds(vb), [vb]);

  const baseBounds = assignment
    ? (textBaseGeometry?.bounds ?? null)
    : elementBounds;
  const activeBounds = assignment
    ? (activeTextGeometry?.bounds ?? baseBounds)
    : (previewBounds ?? baseBounds);

  const activeHandlePoints = activeTextGeometry
    ? getRotatedHandlePoints(activeTextGeometry.points)
    : null;

  const [activeGuides, setActiveGuides] = useState<SnapResult | null>(null);

  const [dragging, setDragging] = useState<DraggingState | null>(null);

  const resetDragState = useCallback(() => {
    setPreviewBounds(null);
    setPreviewLocalRect(null);
    setDragging(null);
    setActiveGuides(null);
  }, []);

  const startDrag = useCallback(
    (e: React.PointerEvent, mode: 'move' | HandleId) => {
      e.stopPropagation();
      e.preventDefault();

      const svg = svgRef.current;
      if (!svg) return;
      const result = clientToSvgPoint(svg, e.clientX, e.clientY);
      if (!result) return;

      const svgEl = querySvgElement();
      const { nodeIndex } = useAnnotatorStore.getState();
      const snapTargets = svgEl
        ? collectSnapTargets(svgEl, nodeIndex, nodeId, cardBounds)
        : { x: [], y: [] };
      const svgToParent = svgEl
        ? computeSvgToParent(svgEl, nodeId)
        : new DOMMatrix();

      if (assignment && activeTextGeometry) {
        const startLocalPt = result.svgPt.matrixTransform(
          activeTextGeometry.svgToLocal
        );
        const textBase = {
          kind: 'text' as const,
          startLocalRect: { ...activeTextGeometry.localRect },
          startLocalPt,
          startBounds: activeTextGeometry.bounds,
          localToSvg: activeTextGeometry.localToSvg,
          svgToLocal: activeTextGeometry.svgToLocal,
          svgToParent,
        };

        setDragging(
          mode === 'move'
            ? { ...textBase, mode: 'move', snapTargets }
            : { ...textBase, mode: 'resize', handle: mode }
        );
        return;
      }

      if (!activeBounds) return;

      if (mode === 'move') {
        setDragging({
          kind: 'axis',
          mode: 'move',
          startBounds: { ...activeBounds },
          startPt: result.svgPt,
          ctmInverse: result.ctmInverse,
          snapTargets,
          svgToParent,
        });
      } else {
        setDragging({
          kind: 'axis',
          mode: 'resize',
          handle: mode,
          startBounds: { ...activeBounds },
          startPt: result.svgPt,
          ctmInverse: result.ctmInverse,
          snapTargets,
          svgToParent,
        });
      }
    },
    [activeBounds, activeTextGeometry, assignment, cardBounds, nodeId]
  );

  useEffect(() => {
    if (!dragging) return;

    const snapThreshold = Math.min(vb.width, vb.height) * 0.008;

    if (dragging.kind === 'text') {
      const toLocalPt = (clientX: number, clientY: number): DOMPoint | null => {
        const svg = svgRef.current;
        if (!svg) return null;
        const result = clientToSvgPoint(svg, clientX, clientY);
        if (!result) return null;
        return result.svgPt.matrixTransform(dragging.svgToLocal);
      };

      const localRectBounds = (rect: TouchBounds): TouchBounds =>
        getBoundsFromPoints(
          getTransformedRectPoints(rect, dragging.localToSvg)
        );

      const computeMoveRect = (
        dx: number,
        dy: number,
        snapTargets: SnapTargets
      ): { rect: TouchBounds; snap: SnapResult } => {
        let rect = {
          ...dragging.startLocalRect,
          x: dragging.startLocalRect.x + dx,
          y: dragging.startLocalRect.y + dy,
        };

        let bounds = localRectBounds(rect);

        const snap = computeSnap(bounds, snapTargets, snapThreshold, 'move');
        const snapDx = snap.x?.delta ?? 0;
        const snapDy = snap.y?.delta ?? 0;
        if (snapDx !== 0 || snapDy !== 0) {
          rect = shiftLocalRectInSvgSpace(
            rect,
            dragging.localToSvg,
            dragging.svgToLocal,
            snapDx,
            snapDy
          );
          bounds = localRectBounds(rect);
        }

        const clamp = getClampDelta(bounds, cardBounds);
        if (clamp.dx !== 0 || clamp.dy !== 0) {
          rect = shiftLocalRectInSvgSpace(
            rect,
            dragging.localToSvg,
            dragging.svgToLocal,
            clamp.dx,
            clamp.dy
          );
        }

        return { rect, snap };
      };

      const onMove = (e: PointerEvent) => {
        const localPt = toLocalPt(e.clientX, e.clientY);
        if (!localPt) return;

        const dx = localPt.x - dragging.startLocalPt.x;
        const dy = localPt.y - dragging.startLocalPt.y;

        if (dragging.mode === 'move') {
          const { rect, snap } = computeMoveRect(dx, dy, dragging.snapTargets);
          setPreviewLocalRect(rect);
          setActiveGuides(snap);
        } else {
          setPreviewLocalRect(
            applyResizeDelta(dragging.handle, dragging.startLocalRect, dx, dy)
          );
          setActiveGuides(null);
        }
      };

      const onUp = (e: PointerEvent) => {
        const localPt = toLocalPt(e.clientX, e.clientY);
        if (!localPt) {
          resetDragState();
          return;
        }

        const dx = localPt.x - dragging.startLocalPt.x;
        const dy = localPt.y - dragging.startLocalPt.y;

        const finalLocalRect =
          dragging.mode === 'move'
            ? computeMoveRect(dx, dy, dragging.snapTargets).rect
            : applyResizeDelta(
                dragging.handle,
                dragging.startLocalRect,
                dx,
                dy
              );

        const startOrigin = transformPoint(
          dragging.localToSvg,
          dragging.startLocalRect.x,
          dragging.startLocalRect.y
        );
        const finalOrigin = transformPoint(
          dragging.localToSvg,
          finalLocalRect.x,
          finalLocalRect.y
        );
        const translateDx = finalOrigin.x - startOrigin.x;
        const translateDy = finalOrigin.y - startOrigin.y;

        const { nodeMap } = useAnnotatorStore.getState();
        const node = nodeMap.get(nodeId);
        const existingTransform =
          node?.type === 'element' ? node.attributes.transform : undefined;

        const parentDelta = transformVector(
          dragging.svgToParent,
          translateDx,
          translateDy
        );

        if (dragging.mode === 'move') {
          if (
            Math.abs(parentDelta.x) > 0.01 ||
            Math.abs(parentDelta.y) > 0.01
          ) {
            commitNodeTransform(
              nodeId,
              applyTranslate(existingTransform, parentDelta.x, parentDelta.y)
            );
          }
        } else if (assignment) {
          commitTextAreaResize(
            nodeId,
            assignment.fieldId,
            Math.round(finalLocalRect.width),
            Math.round(finalLocalRect.height),
            parentDelta.x,
            parentDelta.y
          );
        }

        resetDragState();
      };

      const onCancel = () => resetDragState();

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onCancel);
      return () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onCancel);
      };
    }

    if (!baseBounds) return;

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
      return { bounds: clampToViewBox(snapped, cardBounds), snap };
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
      setPreviewBounds(bounds);
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
        const parentDelta = transformVector(dragging.svgToParent, tdx, tdy);
        if (Math.abs(parentDelta.x) > 0.01 || Math.abs(parentDelta.y) > 0.01) {
          commitNodeTransform(
            nodeId,
            applyTranslate(existingTransform, parentDelta.x, parentDelta.y)
          );
        }
      } else {
        const sx = finalBounds.width / baseBounds.width;
        const sy = finalBounds.height / baseBounds.height;
        if (Math.abs(sx - 1) > 0.001 || Math.abs(sy - 1) > 0.001) {
          const { ax, ay } = getAnchor(dragging.handle, baseBounds);
          if (!dragging.svgToParent.isIdentity) {
            const svgScaleOp = new DOMMatrix()
              .translateSelf(ax, ay)
              .scaleSelf(sx, sy)
              .translateSelf(-ax, -ay);
            const parentOp = conjugateTransform(
              dragging.svgToParent,
              svgScaleOp
            );
            commitNodeTransform(
              nodeId,
              applyMatrixPrepend(existingTransform, parentOp)
            );
          } else {
            commitNodeTransform(
              nodeId,
              applyScaleAroundPoint(existingTransform, ax, ay, sx, sy)
            );
          }
        }
      }

      resetDragState();
    };

    const onCancel = () => resetDragState();

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
    };
  }, [
    assignment,
    baseBounds,
    cardBounds,
    commitNodeTransform,
    commitTextAreaResize,
    dragging,
    nodeId,
    resetDragState,
    vb.height,
    vb.width,
  ]);

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
      {!hideBackground && (
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
      )}

      {activeTextGeometry ? (
        <>
          <polygon
            points={toPolygonPoints(activeTextGeometry.points)}
            fill="rgba(255, 140, 0, 0.08)"
            stroke="rgb(255, 140, 0)"
            strokeWidth={handleSize / 4}
            strokeDasharray={`${handleSize} ${handleSize / 2}`}
            style={{
              pointerEvents: 'all',
              cursor:
                dragging?.mode === 'move' && dragging.kind === 'text'
                  ? 'grabbing'
                  : 'grab',
            }}
            onPointerDown={(e) => startDrag(e, 'move')}
          />

          {HANDLES.map((handle) => {
            const point = activeHandlePoints?.[handle.id];
            if (!point) return null;

            return (
              <rect
                key={handle.id}
                x={point.x - handleSize / 2}
                y={point.y - handleSize / 2}
                width={handleSize}
                height={handleSize}
                fill="white"
                stroke="rgb(255, 140, 0)"
                strokeWidth={handleSize / 6}
                style={{
                  cursor: getHandleCursor(
                    handle.id,
                    activeTextGeometry.rotation
                  ),
                  pointerEvents: 'all',
                }}
                onPointerDown={(e) => startDrag(e, handle.id)}
              />
            );
          })}
        </>
      ) : (
        <>
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
              cursor:
                dragging?.mode === 'move' && dragging.kind === 'axis'
                  ? 'grabbing'
                  : 'grab',
            }}
            onPointerDown={(e) => startDrag(e, 'move')}
          />

          {HANDLES.map((handle) => {
            const rawCx = handle.cx(activeBounds);
            const rawCy = handle.cy(activeBounds);
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
                key={handle.id}
                x={cx - handleSize / 2}
                y={cy - handleSize / 2}
                width={handleSize}
                height={handleSize}
                fill="white"
                stroke="rgb(255, 140, 0)"
                strokeWidth={handleSize / 6}
                style={{
                  cursor: getHandleCursor(handle.id),
                  pointerEvents: 'all',
                }}
                onPointerDown={(e) => startDrag(e, handle.id)}
              />
            );
          })}
        </>
      )}

      {activeGuides?.x && (
        <line
          x1={activeGuides.x.guideValue}
          y1={cardBounds.y}
          x2={activeGuides.x.guideValue}
          y2={cardBounds.y + cardBounds.height}
          stroke="rgba(255, 50, 50, 0.7)"
          strokeWidth={handleSize / 6}
          strokeDasharray={`${handleSize / 2} ${handleSize / 4}`}
          style={{ pointerEvents: 'none' }}
        />
      )}
      {activeGuides?.y && (
        <line
          x1={cardBounds.x}
          y1={activeGuides.y.guideValue}
          x2={cardBounds.x + cardBounds.width}
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
