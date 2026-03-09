import { useCallback, useMemo, useRef } from 'react';
import {
  parseViewBox,
  getCardBounds,
  hasBleeds,
} from '../utils/svg-overlay-helpers';

import type { TouchBounds } from '../types';
import type { SvgJsonNode } from '@/types/svg';
import { SvgRenderer } from '@/components/svg-renderer/svg-renderer';
import { EDITABLE_FIELDS } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import {
  ANNOTATOR_SVG_WRAPPER_CLASS,
  isNonInteractive,
  supportsTouchBounds,
} from '../utils/svg-node-helpers';
import { ensureTouchBounds } from '../utils/touch-bounds-helpers';
import { TextAreaOverlay } from './text-area-overlay';
import { TouchBoundsOverlay } from './touch-bounds-overlay';
import { TransformOverlay } from './transform-overlay';

import styles from './annotator-canvas.module.css';

export function AnnotatorCanvas() {
  const svgTree = useAnnotatorStore((s) => s.svgTree);
  const selectedNodeId = useAnnotatorStore((s) => s.selectedNodeId);
  const hoveredNodeId = useAnnotatorStore((s) => s.hoveredNodeId);
  const selectNode = useAnnotatorStore((s) => s.selectNode);
  const hoverNode = useAnnotatorStore((s) => s.hoverNode);
  const editingTouchBoundsNodeId = useAnnotatorStore(
    (s) => s.editingTouchBoundsNodeId
  );
  const editingTransformNodeId = useAnnotatorStore(
    (s) => s.editingTransformNodeId
  );
  const editingTextAreaNodeId = useAnnotatorStore(
    (s) => s.editingTextAreaNodeId
  );
  const assignments = useAnnotatorStore((s) => s.assignments);

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

  // Find the text area assignment being edited
  const editingTextAreaAssignment = useMemo(() => {
    if (!editingTextAreaNodeId) return null;
    const found = assignments.find(
      (a) =>
        a.nodeId === editingTextAreaNodeId &&
        a.maxWidth != null &&
        a.maxHeight != null
    );
    return found ?? null;
  }, [editingTextAreaNodeId, assignments]);

  // Get viewBox from svgTree root
  const viewBox =
    svgTree?.type === 'element' ? svgTree.attributes.viewBox : undefined;

  // Inject dynamic <style> for hover/selection highlights so getNodeProps stays stable.
  // Hide the selection outline when an overlay (touch bounds or transform) is active
  // to avoid visual clutter — the overlay already highlights the element.
  const isOverlayActive =
    !!editingTouchBoundsNodeId ||
    !!editingTransformNodeId ||
    !!editingTextAreaNodeId;
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
    if (rules.length === 0) return null;
    return <style>{rules.join('\n')}</style>;
  }, [selectedNodeId, hoveredNodeId, isOverlayActive]);

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
        <SvgRenderer node={svgTree} options={{ getNodeProps }} />
        {bleedInfo && (
          <BleedOverlay
            viewBox={viewBox!}
            outer={bleedInfo.vb}
            inner={bleedInfo.cardBounds}
          />
        )}
        {editingAssignment?.touchBounds && viewBox && (
          <TouchBoundsOverlay
            viewBox={viewBox}
            bounds={editingAssignment.touchBounds}
            nodeId={editingAssignment.nodeId}
            fieldId={editingAssignment.fieldId}
          />
        )}
        {editingTransformNodeId && viewBox && (
          <TransformOverlay viewBox={viewBox} nodeId={editingTransformNodeId} />
        )}
        {editingTextAreaAssignment && viewBox && (
          <TextAreaOverlay
            viewBox={viewBox}
            assignment={editingTextAreaAssignment}
          />
        )}
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
