import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import {
  parseViewBox,
  getCardBounds,
  hasBleeds,
  querySvgElement,
} from '../utils/svg-overlay-helpers';

import type { TouchBounds } from '../types';
import type { SvgJsonNode } from '@/types/svg';
import { SvgRenderer } from '@/components/svg-renderer/svg-renderer';
import { EDITABLE_FIELDS } from '@/features/templates';
import {
  writeColorValue,
  applyOklabOffset,
  isZeroOffset,
} from '@fs-card-engine';

import { useAnnotatorStore } from '../stores/annotator-store';
import {
  ANNOTATOR_SVG_WRAPPER_CLASS,
  isNonInteractive,
  supportsTouchBounds,
} from '../utils/svg-node-helpers';
import { getElementGeometryInSvgRoot } from '../utils/get-element-bbox';
import { normalizeImportedTextAreaDimensions } from '../utils/svg-transform-helpers';
import { ensureTouchBounds } from '../utils/touch-bounds-helpers';
import { TouchBoundsOverlay } from './touch-bounds-overlay';
import { TransformOverlay } from './transform-overlay';

import styles from './annotator-canvas.module.css';

/** Distinct outline colors for multi-field highlighting. */
const HIGHLIGHT_COLORS = [
  'var(--mantine-color-violet-5)',
  'var(--mantine-color-teal-5)',
  'var(--mantine-color-orange-5)',
  'var(--mantine-color-pink-5)',
  'var(--mantine-color-cyan-5)',
  'var(--mantine-color-yellow-5)',
];

export function AnnotatorCanvas() {
  const {
    svgTree,
    selectedNodeId,
    hoveredNodeId,
    selectNode,
    hoverNode,
    editingTouchBoundsNodeId,
    editingTransformNodeId,
    bulkTouchBoundsEditing,
    bulkTransformEditing,
    assignments,
    highlightedFieldIds,
    hoveredHighlightFieldId,
    nodeIndex,
    nodeMap,
    previewColors,
  } = useAnnotatorStore(
    useShallow((s) => ({
      svgTree: s.svgTree,
      selectedNodeId: s.selectedNodeId,
      hoveredNodeId: s.hoveredNodeId,
      selectNode: s.selectNode,
      hoverNode: s.hoverNode,
      editingTouchBoundsNodeId: s.editingTouchBoundsNodeId,
      editingTransformNodeId: s.editingTransformNodeId,
      bulkTouchBoundsEditing: s.bulkTouchBoundsEditing,
      bulkTransformEditing: s.bulkTransformEditing,
      assignments: s.assignments,
      highlightedFieldIds: s.highlightedFieldIds,
      hoveredHighlightFieldId: s.hoveredHighlightFieldId,
      nodeIndex: s.nodeIndex,
      nodeMap: s.nodeMap,
      previewColors: s.previewColors,
    }))
  );

  const wrapperRef = useRef<HTMLDivElement>(null);
  const getNodeProps = useCallback(
    (node: SvgJsonNode) => {
      if (node.type === 'text') return undefined;
      if (isNonInteractive(node)) return undefined;
      if (node.name === 'tspan') return undefined;

      const nodeId = node.attributes['__nodeId'];
      if (!nodeId) return undefined;

      return {
        'data-node-id': nodeId,
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          selectNode(nodeId);
        },
        onDoubleClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          const {
            assignments: currentAssignments,
            selectNode: select,
            setEditingTouchBounds,
          } = useAnnotatorStore.getState();
          const assignment = currentAssignments.find(
            (a) =>
              a.nodeId === nodeId &&
              supportsTouchBounds(EDITABLE_FIELDS[a.fieldId].type)
          );
          if (!assignment) return;
          ensureTouchBounds(nodeId, assignment.fieldId);
          select(nodeId);
          setEditingTouchBounds(nodeId);
        },
        onMouseEnter: () => hoverNode(nodeId),
        onMouseLeave: () => hoverNode(null),
        style: {
          cursor: 'pointer',
          outlineOffset: '1px',
          transition: 'box-shadow 150ms ease, outline 150ms ease',
          borderRadius: '2px',
        },
      };
    },
    [selectNode, hoverNode]
  );

  // Find the touch bounds assignment being edited
  const editingAssignment = useMemo(() => {
    if (!editingTouchBoundsNodeId) return null;
    const found = assignments.find((a) => {
      if (a.nodeId !== editingTouchBoundsNodeId || !a.touchBounds) return false;
      return supportsTouchBounds(EDITABLE_FIELDS[a.fieldId].type);
    });
    return found ?? null;
  }, [editingTouchBoundsNodeId, assignments]);

  // Find text assignment for the transform overlay (text elements resize maxWidth/maxHeight)
  const editingTransformAssignment = useMemo(() => {
    if (!editingTransformNodeId) return null;
    return (
      assignments.find(
        (a) =>
          a.nodeId === editingTransformNodeId &&
          EDITABLE_FIELDS[a.fieldId].type === 'text' &&
          a.maxWidth != null &&
          a.maxHeight != null
      ) ?? null
    );
  }, [editingTransformNodeId, assignments]);

  // Bulk editing: all text assignments with touch bounds / text dimensions
  const bulkTouchAssignments = useMemo(() => {
    if (!bulkTouchBoundsEditing) return [];
    return assignments.filter(
      (a) =>
        a.touchBounds && supportsTouchBounds(EDITABLE_FIELDS[a.fieldId].type)
    );
  }, [bulkTouchBoundsEditing, assignments]);

  const bulkTransformAssignments = useMemo(() => {
    if (!bulkTransformEditing) return [];
    return assignments.filter(
      (a) =>
        EDITABLE_FIELDS[a.fieldId].type === 'text' &&
        a.maxWidth != null &&
        a.maxHeight != null
    );
  }, [bulkTransformEditing, assignments]);

  // Track which svgTree identity we've already normalized for, so the effect
  // doesn't re-run after it mutates assignments (which is its own dependency).
  const normalizedForTreeRef = useRef<SvgJsonNode | null>(null);

  useLayoutEffect(() => {
    if (!svgTree || assignments.length === 0) return;
    if (normalizedForTreeRef.current === svgTree) return;

    const svgEl = querySvgElement();
    if (!svgEl) return;

    normalizedForTreeRef.current = svgTree;

    let didNormalize = false;
    const nextAssignments = assignments.map((assignment) => {
      if (EDITABLE_FIELDS[assignment.fieldId].type !== 'text') {
        return assignment;
      }
      if (assignment.maxWidth == null || assignment.maxHeight == null) {
        return assignment;
      }

      const geometry = getElementGeometryInSvgRoot(svgEl, assignment.nodeId);
      if (!geometry) return assignment;

      const normalized = normalizeImportedTextAreaDimensions({
        storedWidth: assignment.maxWidth,
        storedHeight: assignment.maxHeight,
        rotation: geometry.rotation,
        renderedBounds: geometry.bounds,
        localBounds: geometry.localBounds,
      });
      const nextWidth = Math.round(normalized.width);
      const nextHeight = Math.round(normalized.height);

      if (
        nextWidth === assignment.maxWidth &&
        nextHeight === assignment.maxHeight
      ) {
        return assignment;
      }

      didNormalize = true;
      return {
        ...assignment,
        maxWidth: nextWidth,
        maxHeight: nextHeight,
      };
    });

    if (didNormalize) {
      useAnnotatorStore.setState({ assignments: nextAssignments });
    }
  }, [assignments, svgTree]);

  // Get viewBox from svgTree root
  const viewBox =
    svgTree?.type === 'element' ? svgTree.attributes.viewBox : undefined;

  // Inject dynamic <style> for hover/selection highlights so getNodeProps stays stable.
  // Hide the selection outline when an overlay (touch bounds or transform) is active
  // to avoid visual clutter — the overlay already highlights the element.
  const isOverlayActive =
    !!editingTouchBoundsNodeId ||
    !!editingTransformNodeId ||
    bulkTouchBoundsEditing ||
    bulkTransformEditing;
  const highlightStyle = useMemo(() => {
    const rules: string[] = [];
    if (selectedNodeId && !isOverlayActive) {
      rules.push(
        `[data-node-id="${selectedNodeId}"] { outline: 2px solid var(--mantine-color-primary-4); }`
      );
    }
    if (hoveredNodeId && hoveredNodeId !== selectedNodeId) {
      rules.push(
        `[data-node-id="${hoveredNodeId}"] { outline: 2px dashed var(--mantine-color-primary-3); }`
      );
    }
    // Color area highlights — each active field gets a distinct color
    const activeFieldIds = new Set(highlightedFieldIds);
    if (hoveredHighlightFieldId) activeFieldIds.add(hoveredHighlightFieldId);

    if (activeFieldIds.size > 0) {
      // Assign a distinct color to each highlighted field
      const fieldColors = new Map<string, string>();
      let idx = 0;
      for (const fid of activeFieldIds) {
        fieldColors.set(fid, HIGHLIGHT_COLORS[idx % HIGHLIGHT_COLORS.length]);
        idx++;
      }

      // Build gradient-to-visible-elements map for stop assignments.
      // Gradient stops are inside <defs> and invisible — we need to find
      // which visible elements reference the parent gradient via fill/stroke url().
      const gradientVisibleNodes = new Map<string, string[]>();
      const stopGradientIds = new Set<string>();

      for (const a of assignments) {
        if (!fieldColors.has(a.fieldId)) continue;
        const meta = nodeIndex.get(a.nodeId);
        if (meta?.tagName !== 'stop' || !meta.parentNodeId) continue;
        const parentNode = nodeMap.get(meta.parentNodeId);
        const gradId = parentNode?.attributes?.id;
        if (gradId) stopGradientIds.add(gradId);
      }

      if (stopGradientIds.size > 0) {
        for (const [nid, node] of nodeMap) {
          if (node.type === 'text') continue;
          const fill = node.attributes?.fill ?? '';
          const stroke = node.attributes?.stroke ?? '';
          for (const gradId of stopGradientIds) {
            const ref = `url(#${gradId})`;
            if (fill.includes(ref) || stroke.includes(ref)) {
              let arr = gradientVisibleNodes.get(gradId);
              if (!arr) {
                arr = [];
                gradientVisibleNodes.set(gradId, arr);
              }
              arr.push(nid);
            }
          }
        }
      }

      const emitted = new Set<string>();
      for (const a of assignments) {
        const color = fieldColors.get(a.fieldId);
        if (color) {
          const meta = nodeIndex.get(a.nodeId);
          if (meta?.tagName === 'stop' && meta.parentNodeId) {
            // Gradient stop → highlight visible elements using this gradient
            const parentNode = nodeMap.get(meta.parentNodeId);
            const gradId = parentNode?.attributes?.id;
            if (gradId) {
              const visibleNodes = gradientVisibleNodes.get(gradId);
              if (visibleNodes) {
                for (const vNodeId of visibleNodes) {
                  const key = `${vNodeId}-${color}`;
                  if (emitted.has(key)) continue;
                  emitted.add(key);
                  rules.push(
                    `[data-node-id="${vNodeId}"] { outline: 2px solid ${color}; }`
                  );
                }
              }
            }
          } else {
            // Direct visible element
            rules.push(
              `[data-node-id="${a.nodeId}"] { outline: 2px solid ${color}; }`
            );
          }
        }
        const textColor = a.textColorArea
          ? fieldColors.get(a.textColorArea)
          : undefined;
        if (textColor) {
          rules.push(
            `[data-node-id="${a.nodeId}"] { outline: 2px dashed ${textColor}; }`
          );
        }
      }
    }
    if (rules.length === 0) return null;
    return <style>{rules.join('\n')}</style>;
  }, [
    selectedNodeId,
    hoveredNodeId,
    isOverlayActive,
    highlightedFieldIds,
    hoveredHighlightFieldId,
    assignments,
    nodeIndex,
    nodeMap,
  ]);

  // Live color preview — clone the SVG tree and apply preview colors.
  // Non-destructive: the real svgTree is never modified.
  const previewTree = useMemo(() => {
    if (!svgTree || previewColors.size === 0) return null;

    const clone = structuredClone(svgTree);

    // Build a nodeMap for the clone
    const cloneNodes = new Map<string, SvgJsonNode>();
    function walkClone(node: SvgJsonNode) {
      const id = node.attributes?.['__nodeId'];
      if (id) cloneNodes.set(id, node);
      if (node.children) {
        for (const child of node.children) walkClone(child);
      }
    }
    walkClone(clone);

    // Apply preview colors to color field assignments
    for (const a of assignments) {
      const preview = previewColors.get(a.fieldId);
      if (!preview) continue;

      const node = cloneNodes.get(a.nodeId);
      if (!node) continue;

      const target = a.colorTarget ?? 'fill';
      const derived =
        a.colorOffset && !isZeroOffset(a.colorOffset)
          ? applyOklabOffset(preview.bg, a.colorOffset)
          : preview.bg;
      writeColorValue(node, target, derived);
    }

    // Apply text foreground color for text fields linked via textColorArea
    for (const a of assignments) {
      if (!a.textColorArea) continue;
      const preview = previewColors.get(a.textColorArea);
      if (!preview) continue;

      const node = cloneNodes.get(a.nodeId);
      if (!node) continue;
      writeColorValue(node, 'fill', preview.fg);
    }

    return clone;
  }, [svgTree, previewColors, assignments]);

  const bleedInfo = useMemo(() => {
    if (!viewBox) return null;
    const vb = parseViewBox(viewBox);
    if (!hasBleeds(vb)) return null;
    return { vb, cardBounds: getCardBounds(vb) };
  }, [viewBox]);

  if (!svgTree) return null;

  return (
    <div className={styles.canvas} onClick={() => selectNode(null)}>
      {highlightStyle}
      <div
        className={`${styles.svgWrapper} ${ANNOTATOR_SVG_WRAPPER_CLASS}`}
        ref={wrapperRef}
      >
        <SvgRenderer node={previewTree ?? svgTree} options={{ getNodeProps }} />
        {bleedInfo && (
          <BleedOverlay
            viewBox={viewBox!}
            outer={bleedInfo.vb}
            inner={bleedInfo.cardBounds}
          />
        )}
        {/* Single-element touch bounds overlay */}
        {editingAssignment?.touchBounds &&
          viewBox &&
          !bulkTouchBoundsEditing && (
            <TouchBoundsOverlay
              viewBox={viewBox}
              bounds={editingAssignment.touchBounds}
              nodeId={editingAssignment.nodeId}
              fieldId={editingAssignment.fieldId}
            />
          )}
        {/* Bulk touch bounds overlays */}
        {bulkTouchBoundsEditing &&
          viewBox &&
          bulkTouchAssignments.map((a) => (
            <TouchBoundsOverlay
              key={`touch-${a.nodeId}`}
              viewBox={viewBox}
              bounds={a.touchBounds!}
              nodeId={a.nodeId}
              fieldId={a.fieldId}
              hideBackground
            />
          ))}
        {/* Single-element transform overlay */}
        {editingTransformNodeId && viewBox && !bulkTransformEditing && (
          <TransformOverlay
            viewBox={viewBox}
            nodeId={editingTransformNodeId}
            assignment={editingTransformAssignment}
          />
        )}
        {/* Bulk transform overlays */}
        {bulkTransformEditing &&
          viewBox &&
          bulkTransformAssignments.map((a) => (
            <TransformOverlay
              key={`transform-${a.nodeId}`}
              viewBox={viewBox}
              nodeId={a.nodeId}
              assignment={a}
              hideBackground
            />
          ))}
      </div>
    </div>
  );
}

/** Stripe spacing scaled to ~1% of the smaller viewBox dimension. */
function getStripeSize(vb: TouchBounds) {
  return Math.min(vb.width, vb.height) * 0.01;
}

function BleedOverlay({
  viewBox,
  outer: o,
  inner: c,
}: {
  viewBox: string;
  outer: TouchBounds;
  inner: TouchBounds;
}) {
  const bleedTop = c.y - o.y;
  const bleedBottom = o.y + o.height - c.y - c.height;
  const bleedLeft = c.x - o.x;
  const bleedRight = o.x + o.width - c.x - c.width;
  const stripe = getStripeSize(o);
  const patternId = 'bleed-hatch';

  return (
    <svg
      viewBox={viewBox}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'visible',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <pattern
          id={patternId}
          width={stripe}
          height={stripe}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={stripe}
            stroke="rgba(0, 0, 0, 0.18)"
            strokeWidth={stripe * 0.4}
          />
        </pattern>
      </defs>

      {/* Top */}
      <rect
        x={o.x}
        y={o.y}
        width={o.width}
        height={bleedTop}
        fill={`url(#${patternId})`}
      />
      {/* Bottom */}
      <rect
        x={o.x}
        y={c.y + c.height}
        width={o.width}
        height={bleedBottom}
        fill={`url(#${patternId})`}
      />
      {/* Left */}
      <rect
        x={o.x}
        y={c.y}
        width={bleedLeft}
        height={c.height}
        fill={`url(#${patternId})`}
      />
      {/* Right */}
      <rect
        x={c.x + c.width}
        y={c.y}
        width={bleedRight}
        height={c.height}
        fill={`url(#${patternId})`}
      />

      {/* Safe-zone boundary — dashed cut line */}
      <rect
        x={c.x}
        y={c.y}
        width={c.width}
        height={c.height}
        fill="none"
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth={1}
        strokeDasharray="6 4"
      />
    </svg>
  );
}
